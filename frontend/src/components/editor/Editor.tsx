import { useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editor-store';

/**
 * Editor Component
 *
 * Plain textarea-based editor that tracks selection position in real-time.
 * The textarea shows the raw source text — formatting is visible only
 * in the preview panel (and in the exported/copied text).
 */
export default function Editor() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { 
    document, 
    setText, 
    setSelection, 
    toggleStyle, 
    toggleExclusiveStyle,
    insertList,
    clearFormatting,
    insertSectionBreak,
    insertBlockquote,
    wrapHighlight,
    undo, 
    redo 
  } = useEditorStore();
  const selection = useEditorStore((s) => s.selection);

  // ─── External caret sync ────────────────────────────────────
  // When the store updates `selection` (e.g. after a cursor-only list
  // marker insert), move the textarea caret to match.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || !selection) return;
    // Only apply when the textarea isn't the source of the change
    // (i.e. only when the requested caret differs from the current one).
    if (el.selectionStart === selection.start && el.selectionEnd === selection.end) {
      return;
    }
    el.focus();
    el.setSelectionRange(selection.start, selection.end);
  }, [selection, document.sourceText]);

  // ─── Selection Tracking ──────────────────────────────────────
  const updateSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      setSelection({ start, end });
    } else {
      setSelection(null);
    }
  }, [setSelection]);

  // ─── Keyboard Shortcuts ──────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          if (e.shiftKey) {
            toggleStyle('boldItalic');
          } else {
            toggleStyle('bold');
          }
          break;
        case 'i':
          e.preventDefault();
          toggleStyle('italic');
          break;
        case 'u':
          e.preventDefault();
          toggleStyle('underline');
          break;
        case 's':
          if (e.shiftKey) {
            e.preventDefault();
            toggleStyle('strikethrough');
          }
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case 'enter':
          e.preventDefault();
          insertSectionBreak();
          break;
        case '\\':
        case ' ':
          e.preventDefault();
          clearFormatting();
          break;
        case '7':
        case '&': // Shift+7
          if (e.shiftKey) {
            e.preventDefault();
            insertList('number');
          }
          break;
        case '8':
        case '*': // Shift+8
          if (e.shiftKey) {
            e.preventDefault();
            insertList('dot');
          }
          break;
        case 'q':
          if (e.shiftKey) {
            e.preventDefault();
            insertBlockquote();
          }
          break;
        case 'h':
          if (e.shiftKey) {
            e.preventDefault();
            wrapHighlight();
          }
          break;
        case 'a':
          if (e.shiftKey) {
            e.preventDefault();
            toggleExclusiveStyle('sansSerif', ['sansSerif', 'smallCaps', 'doubleStruck']);
          }
          break;
        case 'c':
          if (e.shiftKey) {
            e.preventDefault();
            toggleExclusiveStyle('smallCaps', ['sansSerif', 'smallCaps', 'doubleStruck']);
          }
          break;
        case 'd':
          if (e.shiftKey) {
            e.preventDefault();
            toggleExclusiveStyle('doubleStruck', ['sansSerif', 'smallCaps', 'doubleStruck']);
          }
          break;
      }
    },
    [toggleStyle, toggleExclusiveStyle, insertList, clearFormatting, insertSectionBreak, insertBlockquote, wrapHighlight, undo, redo]
  );

  // ─── Auto-resize ─────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight, 280) + 'px';
  }, [document.sourceText]);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>Editor</span>
        </div>
        {document.sourceText.length > 0 && (
          <span className="editor-hint">
            Select text to format • Ctrl+B Bold • Ctrl+I Italic
          </span>
        )}
      </div>
      <textarea
        ref={textareaRef}
        id="post-editor"
        className="editor-textarea"
        value={document.sourceText}
        onChange={(e) => setText(e.target.value)}
        onSelect={updateSelection}
        onMouseUp={updateSelection}
        onKeyUp={updateSelection}
        onKeyDown={handleKeyDown}
        placeholder="Paste your LinkedIn post here. We'll help you format it — without rewriting it."
        spellCheck={true}
        autoFocus
      />
    </div>
  );
}
