/**
 * Validation Engine
 *
 * Provides content integrity checks and validation (PRD §15).
 */

import { stripUnicodeFormatting } from './unicode-map';
import { normalizeForComparison } from './normalizer';

/**
 * Verify that formatting did not alter the original text content.
 * Returns true if content is intact, false if text was mutated (PRD §15).
 */
export function verifyContentIntegrity(
  sourceText: string,
  formattedText: string
): boolean {
  // 1. Strip all unicode formatting from the formatted output
  const stripped = stripUnicodeFormatting(formattedText);

  // 2. Normalize both texts (collapse whitespace, normalize line endings)
  const normalizedSource = normalizeForComparison(sourceText);
  const normalizedStripped = normalizeForComparison(stripped);

  // 3. Compare them exactly
  return normalizedSource === normalizedStripped;
}
