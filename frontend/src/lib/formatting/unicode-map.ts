/**
 * Unicode Character Mapping Engine
 *
 * Maps standard ASCII characters to their Unicode styled equivalents.
 * LinkedIn and most social platforms render these styled Unicode characters
 * as bold, italic, etc. without any rich-text formatting support.
 *
 * Reference: Unicode Mathematical Alphanumeric Symbols block (U+1D400–U+1D7FF)
 */

import type { TextStyle } from '../../types/formatting';

// ─── Bold (Mathematical Bold) ────────────────────────────────────
// U+1D400–U+1D419 = A–Z, U+1D41A–U+1D433 = a–z, U+1D7CE–U+1D7D7 = 0–9
const BOLD_UPPER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [
    String.fromCodePoint(65 + i), // A–Z
    String.fromCodePoint(0x1d400 + i),
  ])
);
const BOLD_LOWER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [
    String.fromCodePoint(97 + i), // a–z
    String.fromCodePoint(0x1d41a + i),
  ])
);
const BOLD_DIGITS = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [
    String(i),
    String.fromCodePoint(0x1d7ce + i),
  ])
);
const BOLD_MAP: Record<string, string> = {
  ...BOLD_UPPER,
  ...BOLD_LOWER,
  ...BOLD_DIGITS,
};

// ─── Italic (Mathematical Italic) ────────────────────────────────
// U+1D434–U+1D467 = A–Z/a–z (with exception: h → U+210E)
const ITALIC_UPPER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [
    String.fromCodePoint(65 + i),
    String.fromCodePoint(0x1d434 + i),
  ])
);
const ITALIC_LOWER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => {
    const target = i === 7 ? 0x210e : 0x1d44e + i; // 'h' is special
    return [String.fromCodePoint(97 + i), String.fromCodePoint(target)];
  })
);
const ITALIC_MAP: Record<string, string> = {
  ...ITALIC_UPPER,
  ...ITALIC_LOWER,
  // Italic has no digit variants — digits stay as-is
};

// ─── Bold Italic (Mathematical Bold Italic) ──────────────────────
// U+1D468–U+1D49B = A–Z/a–z
const BOLD_ITALIC_UPPER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [
    String.fromCodePoint(65 + i),
    String.fromCodePoint(0x1d468 + i),
  ])
);
const BOLD_ITALIC_LOWER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [
    String.fromCodePoint(97 + i),
    String.fromCodePoint(0x1d482 + i),
  ])
);
const BOLD_ITALIC_MAP: Record<string, string> = {
  ...BOLD_ITALIC_UPPER,
  ...BOLD_ITALIC_LOWER,
};

// ─── Sans-Serif Normal (Mathematical Sans-Serif) ─────────────────
// U+1D5A0–U+1D5B9 = A–Z, U+1D5BA–U+1D5D3 = a–z, U+1D7E2–U+1D7EB = 0–9
const SANS_SERIF_UPPER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [
    String.fromCodePoint(65 + i),
    String.fromCodePoint(0x1d5a0 + i),
  ])
);
const SANS_SERIF_LOWER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [
    String.fromCodePoint(97 + i),
    String.fromCodePoint(0x1d5ba + i),
  ])
);
const SANS_SERIF_DIGITS = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [
    String(i),
    String.fromCodePoint(0x1d7e2 + i),
  ])
);
const SANS_SERIF_MAP: Record<string, string> = {
  ...SANS_SERIF_UPPER,
  ...SANS_SERIF_LOWER,
  ...SANS_SERIF_DIGITS,
};

// ─── Small Caps (Constructed from phonetic extensions) ───────────
const SMALL_CAPS_MAP: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ꞯ', r: 'ʀ',
  s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
};
// Upper case remains the same, as they are already caps.
for (let i = 0; i < 26; i++) {
  const char = String.fromCodePoint(65 + i);
  SMALL_CAPS_MAP[char] = char;
}

// ─── Double Struck (Mathematical Double-Struck) ──────────────────
// U+1D538–U+1D550 = A–Z (with exceptions), U+1D552–U+1D56B = a–z, U+1D7D8–U+1D7E1 = 0–9
const DOUBLE_STRUCK_LOWER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [
    String.fromCodePoint(97 + i),
    String.fromCodePoint(0x1d552 + i),
  ])
);
const DOUBLE_STRUCK_UPPER = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => {
    const overrides: Record<number, number> = { 2: 0x2102, 7: 0x210d, 13: 0x2115, 15: 0x2119, 16: 0x211a, 17: 0x211d, 25: 0x2124 };
    const cp = overrides[i] ?? 0x1d538 + i;
    return [String.fromCodePoint(65 + i), String.fromCodePoint(cp)];
  })
);
const DOUBLE_STRUCK_DIGITS = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [
    String(i),
    String.fromCodePoint(0x1d7d8 + i),
  ])
);
const DOUBLE_STRUCK_MAP: Record<string, string> = {
  ...DOUBLE_STRUCK_UPPER,
  ...DOUBLE_STRUCK_LOWER,
  ...DOUBLE_STRUCK_DIGITS,
};

// ─── Style → Map lookup ─────────────────────────────────────────
const STYLE_MAPS: Record<string, Record<string, string>> = {
  bold: BOLD_MAP,
  italic: ITALIC_MAP,
  boldItalic: BOLD_ITALIC_MAP,
  sansSerif: SANS_SERIF_MAP,
  smallCaps: SMALL_CAPS_MAP,
  doubleStruck: DOUBLE_STRUCK_MAP,
};

// ─── Reverse maps (styled → plain) ──────────────────────────────
function invertMap(map: Record<string, string>): Record<string, string> {
  const inv: Record<string, string> = {};
  for (const [plain, styled] of Object.entries(map)) {
    inv[styled] = plain;
  }
  return inv;
}

const REVERSE_BOLD = invertMap(BOLD_MAP);
const REVERSE_ITALIC = invertMap(ITALIC_MAP);
const REVERSE_BOLD_ITALIC = invertMap(BOLD_ITALIC_MAP);
const REVERSE_SANS_SERIF = invertMap(SANS_SERIF_MAP);
const REVERSE_SMALL_CAPS = invertMap(SMALL_CAPS_MAP);
const REVERSE_DOUBLE_STRUCK = invertMap(DOUBLE_STRUCK_MAP);

const ALL_REVERSE: Record<string, string> = {
  ...REVERSE_BOLD,
  ...REVERSE_ITALIC,
  ...REVERSE_BOLD_ITALIC,
  ...REVERSE_SANS_SERIF,
  ...REVERSE_SMALL_CAPS,
  ...REVERSE_DOUBLE_STRUCK,
};

// ─── Combining character styles ──────────────────────────────────
// Underline: U+0332 (combining low line) appended after each character
// Strikethrough: U+0336 (combining long stroke overlay) appended after each character
const COMBINING_UNDERLINE = '\u0332';
const COMBINING_STRIKETHROUGH = '\u0336';

// ─── Public API ──────────────────────────────────────────────────

/**
 * Convert a single character to its styled Unicode equivalent.
 * Returns the original character if no mapping exists (emoji, punctuation, etc.)
 */
export function styledChar(char: string, style: TextStyle): string {
  if (style === 'underline') {
    return char + COMBINING_UNDERLINE;
  }
  if (style === 'strikethrough') {
    return char + COMBINING_STRIKETHROUGH;
  }
  const map = STYLE_MAPS[style];
  if (!map) return char;
  return map[char] ?? char;
}

/**
 * Convert a string to its styled Unicode equivalent.
 * Iterates codepoint-by-codepoint to handle surrogate pairs (emojis).
 */
export function styledText(text: string, style: TextStyle): string {
  const codepoints = [...text]; // spread correctly splits by codepoint
  return codepoints.map((cp) => styledChar(cp, style)).join('');
}

/**
 * Strip all known Unicode styling from a string, returning plain ASCII.
 * Used for content integrity verification.
 */
export function stripUnicodeFormatting(text: string): string {
  const codepoints = [...text];
  const result: string[] = [];

  for (const cp of codepoints) {
    // Skip combining characters
    if (cp === COMBINING_UNDERLINE || cp === COMBINING_STRIKETHROUGH) {
      continue;
    }
    // Reverse styled characters to plain
    result.push(ALL_REVERSE[cp] ?? cp);
  }

  return result.join('');
}

/**
 * Check if a character is a styled Unicode character.
 */
export function isStyledChar(char: string): boolean {
  return char in ALL_REVERSE;
}

/**
 * Count styled characters in a text string.
 */
export function countStyledChars(text: string): number {
  const codepoints = [...text];
  let count = 0;
  for (const cp of codepoints) {
    if (isStyledChar(cp) || cp === COMBINING_UNDERLINE || cp === COMBINING_STRIKETHROUGH) {
      count++;
    }
  }
  return count;
}

/**
 * List marker characters for structural operations.
 */
export const LIST_MARKERS = {
  arrow: '→',
  dot: '•',
  number: '', // handled differently — prepend index
} as const;
