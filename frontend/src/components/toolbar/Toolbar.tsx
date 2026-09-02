import { useCallback, useMemo } from 'react';
import { useEditorStore } from '../../store/editor-store';
import { selectionHasStyle } from '../../lib/formatting/formatter';
import type { TextStyle } from '../../types/formatting';

/**
 * Formatting Toolbar
 *
 * Provides buttons for all manual formatting styles (PRD §16).
 * Active state is shown when the current selection has that style.
 */
export default function Toolbar() {
  const {
    selection,
    document,
    toggleStyle,
    toggleExclusiveStyle,
    insertList,
    clearFormatting,
    undoStack,
    redoStack,
    undo,
    redo,
    insertSectionBreak,
    insertBlockquote,
    wrapHighlight,
  } = useEditorStore();

  const hasSelection = selection !== null && selection.start !== selection.end;

  const hasStyle = useMemo(() => {
    if (!selection || selection.start === selection.end) {
      return (_style: TextStyle) => false;
    }
    return (style: TextStyle) =>
      selectionHasStyle(document.ranges, selection, style);
  }, [document.ranges, selection]);

  const handleStyle = useCallback(
    (style: TextStyle) => {
      toggleStyle(style);
    },
    [toggleStyle]
  );

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <ToolbarButton
          icon={<span className="toolbar-icon-bold">B</span>}
          label="Bold"
          shortcut="Ctrl+B"
          active={hasStyle('bold')}
          disabled={!hasSelection}
          onClick={() => handleStyle('bold')}
        />
        <ToolbarButton
          icon={<span className="toolbar-icon-italic">I</span>}
          label="Italic"
          shortcut="Ctrl+I"
          active={hasStyle('italic')}
          disabled={!hasSelection}
          onClick={() => handleStyle('italic')}
        />
        <ToolbarButton
          icon={<span className="toolbar-icon-bold-italic">BI</span>}
          label="Bold Italic"
          shortcut="Ctrl+Shift+B"
          active={hasStyle('boldItalic')}
          disabled={!hasSelection}
          onClick={() => handleStyle('boldItalic')}
        />
        <ToolbarButton
          icon={<span className="toolbar-icon-underline">U</span>}
          label="Underline"
          shortcut="Ctrl+U"
          active={hasStyle('underline')}
          disabled={!hasSelection}
          onClick={() => handleStyle('underline')}
        />
        <ToolbarButton
          icon={<span className="toolbar-icon-strike">S</span>}
          label="Strikethrough"
          shortcut="Ctrl+Shift+S"
          active={hasStyle('strikethrough')}
          disabled={!hasSelection}
          onClick={() => handleStyle('strikethrough')}
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <ToolbarButton
          icon={<span>•</span>}
          label="Dot bullets"
          shortcut="Ctrl+Shift+8"
          disabled={!hasSelection}
          onClick={() => insertList('dot')}
        />
        <ToolbarButton
          icon={<span>→</span>}
          label="Arrow bullets"
          disabled={!hasSelection}
          onClick={() => insertList('arrow')}
        />
        <ToolbarButton
          icon={<span>1.</span>}
          label="Numbered list"
          shortcut="Ctrl+Shift+7"
          disabled={!hasSelection}
          onClick={() => insertList('number')}
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <ToolbarButton
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="6" y1="8" x2="6" y2="8.01" />
              <line x1="10" y1="8" x2="10" y2="8.01" />
              <line x1="14" y1="8" x2="14" y2="8.01" />
              <line x1="18" y1="8" x2="18" y2="8.01" />
            </svg>
          }
          label="Section break"
          shortcut="Ctrl+Enter"
          onClick={insertSectionBreak}
        />
        <ToolbarButton
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          }
          label="Blockquote"
          shortcut="Ctrl+Shift+Q"
          disabled={!hasSelection}
          onClick={insertBlockquote}
        />
        <ToolbarButton
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
            </svg>
          }
          label="Highlight (wrap in stars)"
          shortcut="Ctrl+Shift+H"
          disabled={!hasSelection}
          onClick={wrapHighlight}
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <ToolbarButton
          icon={<span className="toolbar-icon-sans-serif" style={{fontFamily: 'sans-serif'}}>A</span>}
          label="Sans-Serif Font"
          shortcut="Ctrl+Shift+A"
          active={hasStyle('sansSerif')}
          disabled={!hasSelection}
          onClick={() => toggleExclusiveStyle('sansSerif', ['sansSerif', 'smallCaps', 'doubleStruck'])}
        />
        <ToolbarButton
          icon={<span className="toolbar-icon-small-caps" style={{fontVariant: 'small-caps'}}>A</span>}
          label="Small Caps"
          shortcut="Ctrl+Shift+C"
          active={hasStyle('smallCaps')}
          disabled={!hasSelection}
          onClick={() => toggleExclusiveStyle('smallCaps', ['sansSerif', 'smallCaps', 'doubleStruck'])}
        />
        <ToolbarButton
          icon={<span className="toolbar-icon-double-struck" style={{fontWeight: '900', letterSpacing: '-1px'}}>𝔸</span>}
          label="Double Struck (Blackboard)"
          shortcut="Ctrl+Shift+D"
          active={hasStyle('doubleStruck')}
          disabled={!hasSelection}
          onClick={() => toggleExclusiveStyle('doubleStruck', ['sansSerif', 'smallCaps', 'doubleStruck'])}
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <ToolbarButton
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          }
          label="Undo"
          shortcut="Ctrl+Z"
          disabled={undoStack.length === 0}
          onClick={undo}
        />
        <ToolbarButton
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          }
          label="Redo"
          shortcut="Ctrl+Y"
          disabled={redoStack.length === 0}
          onClick={redo}
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <ToolbarButton
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          }
          label="Clear formatting"
          shortcut="Ctrl+\\"
          onClick={clearFormatting}
        />
      </div>
    </div>
  );
}

// ─── Toolbar Button ──────────────────────────────────────────────

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  icon,
  label,
  shortcut,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      className={`toolbar-btn ${active ? 'toolbar-btn-active' : ''}`}
      title={shortcut ? `${label} (${shortcut})` : label}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      type="button"
    >
      {icon}
    </button>
  );
}
