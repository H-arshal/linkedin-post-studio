import { useCallback, useEffect, useMemo, useState } from 'react';
import Editor from './components/editor/Editor';
import Toolbar from './components/toolbar/Toolbar';
import Counters from './components/counters/Counters';
import AiFormatPanel from './components/ai/AiFormatPanel';
import Preview from './components/preview/Preview';
import ShortcutHelp from './components/ShortcutHelp';
import { useEditorStore } from './store/editor-store';
import { copyToClipboard } from './lib/clipboard/clipboard';
import { renderFormattedText } from './lib/formatting/formatter';
import { applyTheme, getInitialTheme, toggleTheme } from './lib/theme/theme';

function App() {
  const {
    document,
    clearAll,
    loadSavedDraft,
    copyFeedback,
    setCopyFeedback,
  } = useEditorStore();

  const [draftRestored, setDraftRestored] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const initial = getInitialTheme();
    applyTheme(initial);
    return initial;
  });

  // ─── Keyboard shortcuts listener ───────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        return;
      }
      // '?' (Shift + /) opens the shortcuts modal
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── Compute formatted text via useMemo ──────────────────────
  const formattedText = useMemo(
    () => renderFormattedText(document),
    [document]
  );

  // ─── Restore saved draft on mount ────────────────────────────
  useEffect(() => {
    const restored = loadSavedDraft();
    if (restored) setDraftRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Theme toggle handler ───────────────────────────────────
  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = toggleTheme(prev);
      applyTheme(next);
      return next;
    });
  }, []);

  // ─── Copy to clipboard ──────────────────────────────────────
  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(formattedText);
    if (success) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  }, [formattedText, setCopyFeedback]);

  return (
    <div className="app">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <img src={`${import.meta.env.BASE_URL}icon.png`} alt="LinkedIn Post Studio Logo" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 8 }} />
            <div className="logo-text">
              <h1>LinkedIn Post Studio</h1>
              <span className="logo-tagline">Format it. Preview it. Copy it.</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          {draftRestored && (
            <span className="draft-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Draft restored
            </span>
          )}
          <button
            className="theme-toggle"
            onClick={handleToggleTheme}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            aria-label="Toggle theme"
            type="button"
          >
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
              </svg>
            )}
          </button>
          <button
            className="btn btn-ghost"
            onClick={clearAll}
            disabled={!document.sourceText}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear
          </button>
          <button
            className={`btn btn-primary ${copyFeedback ? 'btn-success' : ''}`}
            onClick={handleCopy}
            disabled={!document.sourceText}
            type="button"
          >
            {copyFeedback ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────── */}
      <main className="app-main">
        <div className="editor-panel">
          <Toolbar />
          <Editor />
          <Counters />
          <AiFormatPanel />
        </div>
        <div className="preview-panel">
          <Preview />
        </div>
      </main>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="app-footer">
        <span>Your words stay yours. We only format them. Press '?' for shortcuts.</span>
      </footer>

      <ShortcutHelp isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}

export default App;
