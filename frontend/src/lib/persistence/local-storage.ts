/**
 * Local Persistence
 *
 * Auto-saves the PostDocument to localStorage on every change (debounced).
 * Restores on page load. No account required (PRD §20).
 */

import type { PostDocument } from '../../types/formatting';

const STORAGE_KEY = 'linkedin-post-studio-draft';
const DEBOUNCE_MS = 500;

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Save a PostDocument to localStorage (debounced).
 */
export function saveDraft(doc: PostDocument): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const serialized = JSON.stringify(doc);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.warn('Failed to save draft to localStorage:', e);
    }
  }, DEBOUNCE_MS);
}

/**
 * Load a PostDocument from localStorage.
 * Returns null if no saved draft exists or if parsing fails.
 */
export function loadDraft(): PostDocument | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized) as PostDocument;
  } catch (e) {
    console.warn('Failed to load draft from localStorage:', e);
    return null;
  }
}

/**
 * Clear the saved draft from localStorage.
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear draft from localStorage:', e);
  }
}

/**
 * Check if a saved draft exists.
 */
export function hasSavedDraft(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
