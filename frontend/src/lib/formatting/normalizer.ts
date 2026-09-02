/**
 * Text Normalization Engine
 *
 * Normalizes text for comparison. This is critical for the content integrity
 * checks to ensure the AI did not change the actual content, only the formatting.
 */

/**
 * Normalize text for comparison: collapse whitespace, trim,
 * remove zero-width characters, and normalize line endings.
 */
export function normalizeForComparison(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/\r\n/g, '\n') // Normalize line endings to LF
    .trim(); // Remove leading/trailing whitespace
}
