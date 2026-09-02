/**
 * Clipboard Adapter
 *
 * Handles copying the formatted Unicode text to the system clipboard.
 * Uses the modern Clipboard API with a fallback for older browsers.
 */

/**
 * Copy text to the clipboard.
 * Returns true on success, false on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers / non-secure contexts
    return fallbackCopy(text);
  } catch {
    return fallbackCopy(text);
  }
}

/**
 * Fallback copy using a temporary textarea element.
 */
function fallbackCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}
