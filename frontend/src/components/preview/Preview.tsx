import { useMemo,useState } from 'react';
import { useEditorStore } from '../../store/editor-store';
import { renderFormattedText } from '../../lib/formatting/formatter';

/**
 * Preview Panel
 *
 * Shows the formatted Unicode output in real-time.
 * Simulates a LinkedIn post card appearance (PRD §18).
 * Full preview with desktop/mobile toggle comes in Phase 3.
 */
export default function Preview() {
  const document = useEditorStore((s) => s.document);
  const formattedText = useMemo(() => renderFormattedText(document), [document]);
  const sourceText = document.sourceText;

  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isLongPost = sourceText.split('\n').length > 5 || sourceText.length > 200;
  const isEmpty = !sourceText.trim();

  return (
    <div className="preview-container">
      <div className="preview-header">
        <div className="preview-header-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Preview</span>
          <span className="preview-badge">LinkedIn</span>
        </div>
        <div className="preview-toggles">
          <button 
            className={`preview-toggle ${!isMobile ? 'active' : ''}`}
            onClick={() => setIsMobile(false)}
            title="Desktop view"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </button>
          <button 
            className={`preview-toggle ${isMobile ? 'active' : ''}`}
            onClick={() => setIsMobile(true)}
            title="Mobile view"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div className={`preview-scroll-area ${isMobile ? 'is-mobile' : ''}`}>
        {/* LinkedIn Card Simulation — kept mounted so the max-width CSS transition runs smoothly */}
        <div className="linkedin-card">
          {/* Profile Header */}
          <div className="linkedin-profile">
            <div className="linkedin-avatar">
              <img src={`${import.meta.env.BASE_URL}profile-pic.png`} alt="Lutario Pecs" />
            </div>
            <div className="linkedin-profile-info">
              <span className="linkedin-name">Lutario Pecs</span>
              <span className="linkedin-headline">SDE @ Company</span>
              <span className="linkedin-time">12h · <span className="linkedin-globe">🌐</span></span>
            </div>
          </div>

          {/* Post Body */}
          <div className="linkedin-body-container">
            {isEmpty ? (
              <div className="linkedin-body linkedin-body-placeholder">
                Write your post…
              </div>
            ) : (
              <>
                <div className={`linkedin-body ${!isExpanded && isLongPost ? 'collapsed' : ''}`}>
                  {formattedText}
                </div>
                {isLongPost && !isExpanded && (
                  <button
                    className="linkedin-see-more"
                    onClick={() => setIsExpanded(true)}
                    type="button"
                  >
                    ...see more
                  </button>
                )}
              </>
            )}
          </div>

          {/* Engagement Row */}
          <div className="linkedin-engagement">
            <div className="linkedin-reactions">
              <span className="linkedin-reaction-icons">
                {/* Like — blue thumbs up */}
                <span className="reaction reaction-like" aria-label="Like">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a66c2">
                    <path d="M19.46 11l-3.91-3.91a7 7 0 0 1-1.69-2.74l-.49-1.49A.6.6 0 0 0 12.8 2.5l-.79.79a1 1 0 0 0-.29.7v.18a4 4 0 0 1-1.11 2.83l-3 3a2 2 0 0 0-.59 1.42v5.5A2 2 0 0 0 9 18.5h7.4a2 2 0 0 0 1.96-1.6l1.39-4.51a2 2 0 0 0-1.29-1.39zM7 18.5a1 1 0 0 1-1-1v-5.5a1 1 0 0 1 1-1h1v7.5z" />
                  </svg>
                </span>
                {/* Insight — yellow bulb */}
                <span className="reaction reaction-insight" aria-label="Insightful">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5b800">
                    <path d="M12 2a7 7 0 0 0-4 12.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2zm-2 19a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z" />
                  </svg>
                </span>
                {/* Love — red heart */}
                <span className="reaction reaction-love" aria-label="Love">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#df3f3f">
                    <path d="M20.34 4.93a6.06 6.06 0 0 0-8.34 0L12 4.93l-.01-.01a6.06 6.06 0 0 0-8.34 8.32l.01.01L12 21.5l8.34-8.25.01-.01a6.06 6.06 0 0 0 0-8.31z" />
                  </svg>
                </span>
              </span>
              <span className="linkedin-reaction-count">352</span>
            </div>
            <div className="linkedin-meta">
              <span>43 comments</span>
              <span className="meta-dot">·</span>
              <span>34 reposts</span>
            </div>
          </div>

          <div className="linkedin-divider" />

          {/* Action Row */}
          <div className="linkedin-actions">
            <button className="linkedin-action" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7" />
              </svg>
              Like
            </button>
            <button className="linkedin-action" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Comment
            </button>
            <button className="linkedin-action" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              Repost
            </button>
            <button className="linkedin-action" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" />
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
