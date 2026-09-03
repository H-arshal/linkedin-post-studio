import { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editor-store';
import { formatTextWithAi } from '../../lib/ai/client';

const STYLES = ['Professional', 'Bold & Punchy', 'Technical', 'Clean'];

export default function AiFormatPanel() {
  const document = useEditorStore((s) => s.document);
  const isFormatting = useEditorStore((s) => s.isFormatting);
  const setIsFormatting = useEditorStore((s) => s.setIsFormatting);
  const applyAiFormatting = useEditorStore((s) => s.applyAiFormatting);

  const [selectedStyle, setSelectedStyle] = useState('Professional');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Live timer while formatting — gives the user feedback that something is happening
  useEffect(() => {
    if (!isFormatting) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => clearInterval(id);
  }, [isFormatting]);

  const handleFormat = async () => {
    if (!document.sourceText.trim()) {
      setError('Please enter some text to format.');
      return;
    }

    setError(null);
    setIsFormatting(true);

    try {
      const response = await formatTextWithAi({
        text: document.sourceText,
        style: selectedStyle,
        customInstructions: showAdvanced ? customInstructions : undefined,
      });

      if (response.success && response.plan) {
        applyAiFormatting(response.plan);
      } else {
        setError(response.errorMessage || 'Formatting failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          <path d="M12 12c-4.97 0-9-1.34-9-3s4.03-3 9-3 9 1.34 9 3-4.03 3-9 3z"></path>
        </svg>
        <span>AI Formatting</span>
      </div>

      <div className="ai-panel-content">
        <div className="ai-style-selector">
          {STYLES.map((style) => (
            <button
              key={style}
              type="button"
              className={`ai-style-btn ${selectedStyle === style ? 'active' : ''}`}
              onClick={() => setSelectedStyle(style)}
              disabled={isFormatting}
            >
              {style}
            </button>
          ))}
        </div>

        {showAdvanced && (
          <div className="ai-advanced">
            <input
              type="text"
              placeholder="e.g. Make the hook highly controversial..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="ai-input"
              disabled={isFormatting}
            />
          </div>
        )}

        <div className="ai-actions">
          <button
            type="button"
            className="ai-advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isFormatting}
          >
            {showAdvanced ? 'Hide Options' : 'Custom Instructions'}
          </button>

          <button
            type="button"
            className={`btn btn-primary ai-submit-btn ${isFormatting ? 'loading' : ''}`}
            onClick={handleFormat}
            disabled={isFormatting || !document.sourceText.trim()}
          >
            {isFormatting ? (
              <span className="spinner"></span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            )}
            {isFormatting ? `Formatting… ${elapsed}s` : 'Format with AI'}
          </button>
        </div>

        {isFormatting && elapsed >= 10 && (
          <div className="ai-status">
            {elapsed < 30 && 'Analyzing your post…'}
            {elapsed >= 30 && elapsed < 60 && 'Still working — first request can be slow while the model warms up…'}
            {elapsed >= 60 && 'This is taking longer than usual. Cold starts can take up to 2 minutes — hang tight…'}
          </div>
        )}

        {error && <div className="ai-error">{error}</div>}
      </div>
    </div>
  );
}
