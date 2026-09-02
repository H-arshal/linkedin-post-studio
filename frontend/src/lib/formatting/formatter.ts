/**
 * Unified Formatting Engine
 *
 * Both manual toolbar actions and future AI formatting plans are converted
 * into TextRange[] / StructuralOperation[] and processed through this
 * single engine. This prevents duplicated logic (PRD §31).
 *
 * The source text is NEVER mutated. Formatting is applied at export time
 * by mapping characters through the Unicode engine.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ListMarker,
  PostDocument,
  StructuralOperation,
  TextRange,
  TextSelection,
  TextStyle,
} from '../../types/formatting';
import { LIST_MARKERS, styledText } from './unicode-map';

// ─── Range Helpers ───────────────────────────────────────────────

/**
 * Create a new TextRange with a generated ID.
 */
export function createRange(
  start: number,
  end: number,
  style: TextStyle
): TextRange {
  return { id: uuidv4(), start, end, style };
}

/**
 * Check if two ranges overlap.
 */
export function rangesOverlap(a: TextRange, b: TextRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Check if a range contains another range entirely.
 */
export function rangeContains(outer: TextRange, inner: TextRange): boolean {
  return outer.start <= inner.start && outer.end >= inner.end;
}

/**
 * Merge overlapping ranges with the same style.
 */
export function mergeRanges(ranges: TextRange[]): TextRange[] {
  if (ranges.length <= 1) return ranges;

  const grouped = new Map<TextStyle, TextRange[]>();
  for (const r of ranges) {
    if (!grouped.has(r.style)) grouped.set(r.style, []);
    grouped.get(r.style)!.push(r);
  }

  const merged: TextRange[] = [];
  for (const [style, group] of grouped) {
    const sorted = [...group].sort((a, b) => a.start - b.start);
    let current = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      if (next.start <= current.end) {
        // Overlapping or adjacent — merge
        current.end = Math.max(current.end, next.end);
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
    merged.push(current);
    void style; // suppress unused warning
  }

  return merged.sort((a, b) => a.start - b.start);
}

// ─── Apply Formatting to Selection ───────────────────────────────

/**
 * Add a formatting style to the given selection.
 * Returns a new ranges array (immutable).
 */
export function addFormatting(
  ranges: TextRange[],
  selection: TextSelection,
  style: TextStyle
): TextRange[] {
  const newRange = createRange(selection.start, selection.end, style);
  return mergeRanges([...ranges, newRange]);
}

/**
 * Remove a formatting style from the given selection.
 * Splits existing ranges that overlap with the selection.
 */
export function removeFormatting(
  ranges: TextRange[],
  selection: TextSelection,
  style: TextStyle
): TextRange[] {
  const result: TextRange[] = [];

  for (const range of ranges) {
    if (range.style !== style) {
      result.push(range);
      continue;
    }

    // No overlap — keep as is
    if (range.end <= selection.start || range.start >= selection.end) {
      result.push(range);
      continue;
    }

    // Left remainder
    if (range.start < selection.start) {
      result.push(createRange(range.start, selection.start, style));
    }

    // Right remainder
    if (range.end > selection.end) {
      result.push(createRange(selection.end, range.end, style));
    }
  }

  return result;
}

/**
 * Toggle a formatting style on the selection.
 * If the entire selection already has the style, remove it. Otherwise, add it.
 */
export function toggleFormatting(
  ranges: TextRange[],
  selection: TextSelection,
  style: TextStyle
): TextRange[] {
  if (selectionHasStyle(ranges, selection, style)) {
    return removeFormatting(ranges, selection, style);
  }
  return addFormatting(ranges, selection, style);
}

/**
 * Check if the entire selection has a given style.
 */
export function selectionHasStyle(
  ranges: TextRange[],
  selection: TextSelection,
  style: TextStyle
): boolean {
  const styleRanges = ranges
    .filter((r) => r.style === style)
    .sort((a, b) => a.start - b.start);

  let cursor = selection.start;
  for (const range of styleRanges) {
    if (range.start > cursor) return false;
    if (range.start <= cursor && range.end > cursor) {
      cursor = range.end;
    }
    if (cursor >= selection.end) return true;
  }
  return cursor >= selection.end;
}

/**
 * Clear all formatting ranges.
 */
export function clearAllRanges(): TextRange[] {
  return [];
}

// ─── Structural Operations ───────────────────────────────────────

/**
 * Insert a list marker at each line start within the selection.
 */
export function insertListMarkers(
  sourceText: string,
  selection: TextSelection,
  marker: ListMarker
): { text: string; operations: StructuralOperation[] } {
  const before = sourceText.slice(0, selection.start);
  const selected = sourceText.slice(selection.start, selection.end);
  const after = sourceText.slice(selection.end);

  const lines = selected.split('\n');
  const markerSymbol = LIST_MARKERS[marker];
  const operations: StructuralOperation[] = [];

  const formatted = lines
    .map((line, index) => {
      const trimmed = line.trimStart();
      if (!trimmed) return line; // skip empty lines

      let prefix: string;
      if (marker === 'number') {
        prefix = `${index + 1}. `;
      } else {
        prefix = `${markerSymbol} `;
      }

      operations.push({
        id: uuidv4(),
        type: 'list',
        start: selection.start + lines.slice(0, index).join('\n').length,
        end:
          selection.start +
          lines.slice(0, index).join('\n').length +
          line.length,
        marker,
      });

      return prefix + trimmed;
    })
    .join('\n');

  return {
    text: before + formatted + after,
    operations,
  };
}

// ─── Render / Export ─────────────────────────────────────────────

/**
 * Render the final formatted Unicode text from a PostDocument.
 * This is the main export function — it applies all formatting
 * ranges to the source text using the Unicode mapping engine.
 */
export function renderFormattedText(doc: PostDocument): string {
  const { sourceText, ranges } = doc;
  if (ranges.length === 0) return sourceText;

  // ── Step 1: Apply heading markers (h1/h2/h3) as wrapping ─────
  // Headings are visual blocks: ▎ + bold text + line break.
  // We do this before character-level styling so the bar + bold is consistent.
  const headingRanges = ranges
    .filter((r) => r.style === 'h1' || r.style === 'h2' || r.style === 'h3')
    .sort((a, b) => b.start - a.start); // apply right-to-left so indices stay valid

  let workingText = sourceText;
  for (const r of headingRanges) {
    const level = r.style as 'h1' | 'h2' | 'h3';
    const bar = level === 'h1' ? '▎▎▎ ' : level === 'h2' ? '▎▎ ' : '▎ ';
    const body = workingText.slice(r.start, r.end);
    const boldBody = styledText(body, 'bold');
    const replacement = `\n\n${bar}${boldBody}\n`;
    workingText = workingText.slice(0, r.start) + replacement + workingText.slice(r.end);
  }

  // Recompute codepoints after heading transformations
  const codepoints = [...workingText];
  const charStyles: (TextStyle | null)[] = new Array(codepoints.length).fill(
    null
  );

  // Track character index ↔ codepoint index mapping
  // since workingText.length !== [...workingText].length for emojis
  let charIdx = 0;
  const cpToCharOffset: number[] = [];
  for (const cp of codepoints) {
    cpToCharOffset.push(charIdx);
    charIdx += cp.length;
  }

  // Sort ranges by priority: boldItalic > bold > italic > underline > strikethrough
  const priority: Record<TextStyle, number> = {
    boldItalic: 5,
    bold: 4,
    italic: 3,
    underline: 2,
    strikethrough: 1,
    h1: 0,
    h2: 0,
    h3: 0,
    sansSerif: 4,
    smallCaps: 4,
    doubleStruck: 4,
  };
  // Skip h1/h2/h3 in the character loop — they've already been rendered.
  const charLoopRanges = ranges.filter(
    (r) => r.style !== 'h1' && r.style !== 'h2' && r.style !== 'h3'
  );
  const sortedRanges = [...charLoopRanges].sort(
    (a, b) => priority[b.style] - priority[a.style]
  );

  // For combining styles (underline, strikethrough), we layer them
  const combiningStyles: Map<number, TextStyle[]> = new Map();

  for (const range of sortedRanges) {
    for (let i = 0; i < codepoints.length; i++) {
      const offset = cpToCharOffset[i];
      if (offset >= range.start && offset < range.end) {
        if (
          range.style === 'underline' ||
          range.style === 'strikethrough'
        ) {
          if (!combiningStyles.has(i)) combiningStyles.set(i, []);
          combiningStyles.get(i)!.push(range.style);
        } else {
          // Non-combining styles: highest priority wins
          if (charStyles[i] === null) {
            charStyles[i] = range.style;
          }
        }
      }
    }
  }

  // Apply styles
  const result: string[] = [];
  for (let i = 0; i < codepoints.length; i++) {
    let char = codepoints[i];

    // Apply character-replacement styles (bold, italic, boldItalic, script, gothic, monospace)
    const baseStyle = charStyles[i];
    if (baseStyle) {
      char = styledText(char, baseStyle);
    }

    // Apply combining styles (underline, strikethrough)
    const combining = combiningStyles.get(i);
    if (combining) {
      for (const style of combining) {
        char = styledText(char, style);
      }
    }

    result.push(char);
  }

  return result.join('');
}



/**
 * Create a new empty PostDocument.
 */
export function createDocument(sourceText = ''): PostDocument {
  return {
    id: uuidv4(),
    sourceText,
    ranges: [],
    structuralOperations: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
