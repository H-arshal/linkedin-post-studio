/**
 * Editor State Store (Zustand)
 *
 * Central state management for the editor. Manages:
 * - Document model (sourceText + formatting ranges)
 * - Selection tracking
 * - Undo/redo with document snapshots
 * - LocalStorage persistence
 */

import { create } from 'zustand';
import type {
  FormattingPlan,
  ListMarker,
  PostDocument,
  TextRange,
  TextSelection,
  TextStyle,
} from '../types/formatting';
import {
  addFormatting,
  clearAllRanges,
  createDocument,
  insertListMarkers,
  removeFormatting,
  toggleFormatting,
} from '../lib/formatting/formatter';
import { loadDraft, saveDraft } from '../lib/persistence/local-storage';
import diff from 'fast-diff';

const MAX_UNDO_STACK = 100;

interface EditorState {
  // ─── State ──────────────────────────────────────────────────
  document: PostDocument;
  selection: TextSelection | null;
  undoStack: PostDocument[];
  redoStack: PostDocument[];
  copyFeedback: boolean;
  isFormatting: boolean;

  // ─── Actions ────────────────────────────────────────────────
  setText: (text: string) => void;
  setSelection: (selection: TextSelection | null) => void;
  applyStyle: (style: TextStyle) => void;
  removeStyle: (style: TextStyle) => void;
  toggleStyle: (style: TextStyle) => void;
  toggleExclusiveStyle: (style: TextStyle, group: TextStyle[]) => void;
  insertList: (marker: ListMarker) => void;
  clearFormatting: () => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  setCopyFeedback: (show: boolean) => void;
  loadSavedDraft: () => boolean;
  setIsFormatting: (isFormatting: boolean) => void;
  applyAiFormatting: (plan: FormattingPlan) => void;
  insertSectionBreak: () => void;
  insertBlockquote: () => void;
  wrapHighlight: () => void;
}

function pushUndo(
  undoStack: PostDocument[],
  doc: PostDocument
): PostDocument[] {
  const stack = [...undoStack, structuredClone(doc)];
  if (stack.length > MAX_UNDO_STACK) stack.shift();
  return stack;
}

let lastTextEditTime = 0;

export const useEditorStore = create<EditorState>((set, get) => ({
  // ─── Initial State ────────────────────────────────────────────
  document: createDocument(),
  selection: null,
  undoStack: [],
  redoStack: [],
  copyFeedback: false,
  isFormatting: false,

  // ─── Actions ──────────────────────────────────────────────────

  setText: (text: string) => {
    const now = Date.now();
    set((state) => {
      const isNewSession = now - lastTextEditTime > 1000;
      lastTextEditTime = now;

      const newDoc: PostDocument = {
        ...state.document,
        sourceText: text,
        ranges: adjustRangesForText(state.document.ranges, state.document.sourceText, text),
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: isNewSession
          ? pushUndo(state.undoStack, state.document)
          : state.undoStack,
        redoStack: [],
      };
    });
  },

  setSelection: (selection: TextSelection | null) => {
    set({ selection });
  },

  applyStyle: (style: TextStyle) => {
    const { selection, document } = get();
    if (!selection || selection.start === selection.end) return;
    set((state) => {
      const newRanges = addFormatting(document.ranges, selection, style);
      const newDoc: PostDocument = {
        ...document,
        ranges: newRanges,
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
      };
    });
  },

  removeStyle: (style: TextStyle) => {
    const { selection, document } = get();
    if (!selection || selection.start === selection.end) return;
    set((state) => {
      const newRanges = removeFormatting(document.ranges, selection, style);
      const newDoc: PostDocument = {
        ...document,
        ranges: newRanges,
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
      };
    });
  },

  toggleStyle: (style: TextStyle) => {
    const { selection, document } = get();
    if (!selection || selection.start === selection.end) return;
    set((state) => {
      const newRanges = toggleFormatting(document.ranges, selection, style);
      const newDoc: PostDocument = {
        ...document,
        ranges: newRanges,
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
      };
    });
  },

  toggleExclusiveStyle: (style: TextStyle, group: TextStyle[]) => {
    const { selection, document } = get();
    if (!selection || selection.start === selection.end) return;
    set((state) => {
      // First, remove all styles in the group (including the target style)
      let currentRanges = document.ranges;
      for (const groupStyle of group) {
        currentRanges = removeFormatting(currentRanges, selection, groupStyle);
      }
      
      // If the target style wasn't already active, apply it
      // To check if it was active, we check the old document.ranges
      const wasActive = document.ranges.some(
        (r) =>
          r.style === style &&
          Math.max(r.start, selection.start) < Math.min(r.end, selection.end)
      );

      let newRanges = currentRanges;
      if (!wasActive) {
        newRanges = addFormatting(newRanges, selection, style);
      }

      const newDoc: PostDocument = {
        ...document,
        ranges: newRanges,
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
      };
    });
  },

  insertList: (marker: ListMarker) => {
    const { selection, document } = get();
    if (!selection) return;

    // Expand selection to full lines
    const text = document.sourceText;
    const lineStart = text.lastIndexOf('\n', selection.start - 1) + 1;
    const lineEnd = text.indexOf('\n', selection.end);
    const expandedSelection: TextSelection = {
      start: lineStart,
      end: lineEnd === -1 ? text.length : lineEnd,
    };

    const result = insertListMarkers(text, expandedSelection, marker);

    set((state) => {
      const newDoc: PostDocument = {
        ...document,
        sourceText: result.text,
        structuralOperations: [
          ...document.structuralOperations,
          ...result.operations,
        ],
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
      };
    });
  },

  insertSectionBreak: () => {
    const { selection, document } = get();
    const text = document.sourceText;
    const cursor = selection?.start ?? text.length;
    const breakText = '\n\n— — —\n\n';
    const newText = text.slice(0, cursor) + breakText + text.slice(cursor);

    set((state) => {
      const newDoc: PostDocument = {
        ...document,
        sourceText: newText,
        ranges: adjustRangesForText(document.ranges, text, newText),
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
      };
    });
  },

  insertBlockquote: () => {
    const { selection, document } = get();
    if (!selection) return;
    const text = document.sourceText;
    const lineStart = text.lastIndexOf('\n', selection.start - 1) + 1;
    const lineEnd = text.indexOf('\n', selection.end);
    const expanded: TextSelection = {
      start: lineStart,
      end: lineEnd === -1 ? text.length : lineEnd,
    };
    const selected = text.slice(expanded.start, expanded.end);
    const quoted = selected
      .split('\n')
      .map((line) => (line.trimStart() ? `▸ ${line.trimStart()}` : line))
      .join('\n');
    const newText = text.slice(0, expanded.start) + quoted + text.slice(expanded.end);

    set((state) => {
      const newDoc: PostDocument = {
        ...document,
        sourceText: newText,
        ranges: adjustRangesForText(document.ranges, text, newText),
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
      };
    });
  },

  wrapHighlight: () => {
    const { selection, document } = get();
    if (!selection || selection.start === selection.end) return;
    const text = document.sourceText;
    const selected = text.slice(selection.start, selection.end);
    const wrapped = `★ ${selected} ★`;
    const newText = text.slice(0, selection.start) + wrapped + text.slice(selection.end);

    set((state) => {
      const newDoc: PostDocument = {
        ...document,
        sourceText: newText,
        ranges: adjustRangesForText(document.ranges, text, newText),
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
      };
    });
  },

  clearFormatting: () => {
    set((state) => {
      const newDoc: PostDocument = {
        ...state.document,
        ranges: clearAllRanges(),
        structuralOperations: [],
        updatedAt: Date.now(),
      };
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
      };
    });
  },

  clearAll: () => {
    set((state) => {
      const newDoc = createDocument();
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
        selection: null,
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      saveDraft(previous);
      return {
        document: previous,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, structuredClone(state.document)],
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      const newRedoStack = state.redoStack.slice(0, -1);
      saveDraft(next);
      return {
        document: next,
        undoStack: [...state.undoStack, structuredClone(state.document)],
        redoStack: newRedoStack,
      };
    });
  },

  setCopyFeedback: (show: boolean) => {
    set({ copyFeedback: show });
  },

  loadSavedDraft: () => {
    const saved = loadDraft();
    if (saved) {
      set({ document: saved, undoStack: [], redoStack: [] });
      return true;
    }
    return false;
  },

  setIsFormatting: (isFormatting: boolean) => {
    set({ isFormatting });
  },

  applyAiFormatting: (plan: import('../types/formatting').FormattingPlan) => {
    set((state) => {
      // 1. Clear existing manual formatting
      let ranges: TextRange[] = [];
      let structural: any[] = [];
      
      // 2. Apply new operations
      for (const op of plan.operations) {
        if (op.type === 'style' && op.style) {
          ranges = addFormatting(ranges, { start: op.start, end: op.end }, op.style);
        } else if (op.type === 'list' && op.marker) {
          structural.push({
            id: op.id,
            type: 'list',
            start: op.start,
            end: op.end,
            marker: op.marker
          });
        }
      }

      // 3. Apply rewritten text if provided
      const newSourceText = plan.rewrittenText || state.document.sourceText;

      const newDoc: PostDocument = {
        ...state.document,
        sourceText: newSourceText,
        ranges,
        structuralOperations: structural,
        updatedAt: Date.now(),
      };
      
      saveDraft(newDoc);
      return {
        document: newDoc,
        undoStack: pushUndo(state.undoStack, state.document),
        redoStack: [],
        isFormatting: false,
      };
    });
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Adjust formatting ranges when source text changes.
 * Uses fast-diff to precisely map old character indices to new ones.
 */
function adjustRangesForText(
  ranges: TextRange[],
  oldText: string,
  newText: string
): TextRange[] {
  if (oldText === newText) return ranges;

  const diffs = diff(oldText, newText);
  
  // Build an index map mapping old character indices to new character indices
  const indexMap: number[] = new Array(oldText.length + 1).fill(0);
  let oldIdx = 0;
  let newIdx = 0;

  for (const [op, text] of diffs) {
    if (op === diff.EQUAL) {
      for (let i = 0; i < text.length; i++) {
        indexMap[oldIdx] = newIdx;
        oldIdx++;
        newIdx++;
      }
    } else if (op === diff.DELETE) {
      for (let i = 0; i < text.length; i++) {
        indexMap[oldIdx] = newIdx; // map deleted chars to the current newIdx
        oldIdx++;
      }
    } else if (op === diff.INSERT) {
      // inserted characters don't consume oldIdx
      newIdx += text.length;
    }
  }
  // Map the final boundary (end of string)
  indexMap[oldText.length] = newIdx;

  // Now map the ranges
  return ranges
    .map((r) => {
      let start = indexMap[r.start];
      let end = indexMap[r.end];
      
      // Safety bounds just in case
      start = Math.max(0, Math.min(start, newText.length));
      end = Math.max(0, Math.min(end, newText.length));

      return { ...r, start, end };
    })
    .filter((r) => r.start < r.end); // Remove ranges that shrunk to 0 length
}
