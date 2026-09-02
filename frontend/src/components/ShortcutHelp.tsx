import { useEffect } from 'react';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutHelp({ isOpen, onClose }: ShortcutHelpProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Formatting',
      shortcuts: [
        { key: 'Ctrl + B', label: 'Bold' },
        { key: 'Ctrl + I', label: 'Italic' },
        { key: 'Ctrl + U', label: 'Underline' },
        { key: 'Ctrl + Shift + B', label: 'Bold Italic' },
        { key: 'Ctrl + Shift + S', label: 'Strikethrough' },
      ],
    },
    {
      title: 'Block Level',
      shortcuts: [
        { key: 'Ctrl + Shift + 8', label: 'Bulleted List' },
        { key: 'Ctrl + Shift + 7', label: 'Numbered List' },
        { key: 'Ctrl + Shift + Q', label: 'Blockquote' },
        { key: 'Ctrl + Enter', label: 'Section Break' },
      ],
    },
    {
      title: 'Professional Fonts',
      shortcuts: [
        { key: 'Ctrl + Shift + A', label: 'Sans-Serif' },
        { key: 'Ctrl + Shift + C', label: 'Small Caps' },
        { key: 'Ctrl + Shift + D', label: 'Double Struck' },
      ],
    },
    {
      title: 'Utility',
      shortcuts: [
        { key: 'Ctrl + \\ or Space', label: 'Clear formatting' },
        { key: 'Ctrl + Shift + H', label: 'Highlight wrap' },
        { key: 'Ctrl + Z', label: 'Undo' },
        { key: 'Ctrl + Y', label: 'Redo' },
      ],
    },
  ];

  return (
    <div className="shortcut-modal-overlay" onClick={onClose}>
      <div className="shortcut-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="shortcut-modal-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="shortcut-modal-close" onClick={onClose} title="Close (Escape)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="shortcut-modal-body">
          <div className="shortcut-grid">
            {shortcutGroups.map((group) => (
              <div key={group.title} className="shortcut-group">
                <h3>{group.title}</h3>
                <ul>
                  {group.shortcuts.map((sc) => (
                    <li key={sc.label}>
                      <span>{sc.label}</span>
                      <kbd>{sc.key}</kbd>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
