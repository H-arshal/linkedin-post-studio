/**
 * Theme Manager
 *
 * Persists the user's chosen theme ('light' | 'dark') to localStorage and
 * applies it as a `data-theme` attribute on <html>. Falls back to the OS
 * `prefers-color-scheme` when no saved preference exists.
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'linkedin-post-studio-theme';

/**
 * Get the initial theme: saved preference, otherwise OS preference,
 * otherwise light.
 */
export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Apply the theme to the document root and persist the choice.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

/**
 * Toggle between light and dark.
 */
export function toggleTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : 'light';
}