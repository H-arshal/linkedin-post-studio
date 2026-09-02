// ─── Text Style Types ────────────────────────────────────────────
export type TextStyle =
  | 'bold'
  | 'italic'
  | 'boldItalic'
  | 'underline'
  | 'strikethrough'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'sansSerif'
  | 'smallCaps'
  | 'doubleStruck';

export type ListMarker = 'arrow' | 'dot' | 'number';

// ─── Formatting Range ────────────────────────────────────────────
// A range within the source text that should receive a style.
// The source text itself is never mutated — styles are applied
// at render/export time by the Unicode formatting engine.
export interface TextRange {
  id: string;
  start: number;
  end: number;
  style: TextStyle;
}

// ─── Structural Operations ───────────────────────────────────────
export type StructuralOperationType = 'list' | 'spacing' | 'lineBreak';

export interface StructuralOperation {
  id: string;
  type: StructuralOperationType;
  start: number;
  end: number;
  marker?: ListMarker;
}

// ─── Formatting Operation (AI response schema) ───────────────────
// This is what the AI returns — a list of operations to apply.
// It is validated, then converted into TextRange[] + StructuralOperation[]
// and fed into the same formatting engine used by manual formatting.
export interface FormattingOperation {
  id: string;
  type: 'style' | 'list' | 'spacing' | 'lineBreak';
  start: number;
  end: number;
  style?: TextStyle;
  marker?: ListMarker;
}

export interface FormattingPlan {
  version: string;
  rewrittenText?: string;
  operations: FormattingOperation[];
}

// ─── Post Document ───────────────────────────────────────────────
// The core document model. sourceText is the single source of truth.
export interface PostDocument {
  id: string;
  sourceText: string;
  ranges: TextRange[];
  structuralOperations: StructuralOperation[];
  createdAt: number;
  updatedAt: number;
}

// ─── Selection ───────────────────────────────────────────────────
export interface TextSelection {
  start: number;
  end: number;
}

// ─── Counters ────────────────────────────────────────────────────
export interface PostCounters {
  characters: number;
  words: number;
  lines: number;
  styledCharacters: number;
}

// ─── Diagnostics ─────────────────────────────────────────────────
export type DiagnosticLevel = 'success' | 'warning' | 'error';

export interface Diagnostic {
  level: DiagnosticLevel;
  message: string;
}

// ─── Constants ───────────────────────────────────────────────────
export const LINKEDIN_CHAR_LIMIT = 3000;
