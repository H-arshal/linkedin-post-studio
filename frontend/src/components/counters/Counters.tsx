import { useMemo } from 'react';
import { useEditorStore } from '../../store/editor-store';
import { renderFormattedText } from '../../lib/formatting/formatter';
import { countStyledChars } from '../../lib/formatting/unicode-map';
import { LINKEDIN_CHAR_LIMIT } from '../../types/formatting';

/**
 * Counters & Diagnostics Bar
 *
 * Real-time statistics about the post (PRD §19):
 * - Character count with LinkedIn limit indicator
 * - Word count
 * - Line count
 * - Styled character count
 */
export default function Counters() {
  const document = useEditorStore((s) => s.document);

  const counters = useMemo(() => {
    const text = document.sourceText;
    const formatted = renderFormattedText(document);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    return {
      characters: [...text].length,
      words,
      lines,
      styledCharacters: countStyledChars(formatted),
    };
  }, [document]);

  const charRatio = counters.characters / LINKEDIN_CHAR_LIMIT;

  const charColor =
    charRatio > 1
      ? 'counter-danger'
      : charRatio > 0.9
        ? 'counter-warning'
        : 'counter-normal';

  return (
    <div className="counters-bar">
      <div className="counters-left">
        <CounterItem
          label="Characters"
          value={counters.characters.toLocaleString()}
          extra={`/ ${LINKEDIN_CHAR_LIMIT.toLocaleString()}`}
          className={charColor}
        />
        <CounterItem
          label="Words"
          value={counters.words.toLocaleString()}
        />
        <CounterItem
          label="Lines"
          value={counters.lines.toLocaleString()}
        />
        {counters.styledCharacters > 0 && (
          <CounterItem
            label="Styled"
            value={counters.styledCharacters.toLocaleString()}
          />
        )}
      </div>

      <div className="counters-right">
        {charRatio > 1 && (
          <span className="counter-badge counter-badge-danger">
            Over limit
          </span>
        )}
        {charRatio > 0.9 && charRatio <= 1 && (
          <span className="counter-badge counter-badge-warning">
            Near limit
          </span>
        )}
        {counters.characters > 0 && charRatio <= 0.9 && (
          <span className="counter-badge counter-badge-success">
            ✓ Good length
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Counter Item ────────────────────────────────────────────────

interface CounterItemProps {
  label: string;
  value: string;
  extra?: string;
  className?: string;
}

function CounterItem({ label, value, extra, className = '' }: CounterItemProps) {
  return (
    <div className={`counter-item ${className}`}>
      <span className="counter-value">{value}</span>
      {extra && <span className="counter-extra">{extra}</span>}
      <span className="counter-label">{label}</span>
    </div>
  );
}
