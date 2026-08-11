import { useState, useRef, useEffect } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { useDrawing } from '../../context/drawing-context-value';
import { Logo } from '../Logo/Logo';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import { ShareDialog } from '../ShareDialog/ShareDialog';
import styles from './TopBar.module.css';

export function TopBar({ readOnly = false }: { readOnly?: boolean }) {
  const { state, setTitle, save } = useDrawing();
  const { metadata } = state.document;
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(metadata.title);
  const [showShare, setShowShare] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleValue(metadata.title);
  }, [metadata.title]);

  useEffect(() => {
    if (editingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTitle]);

  const handleTitleSubmit = () => {
    const trimmed = titleValue.trim() || 'Untitled drawing';
    setTitle(trimmed);
    setTitleValue(trimmed);
    setEditingTitle(false);
  };

  const saveLabel = () => {
    switch (state.saveStatus) {
      case 'saving':
        return (
          <>
            <Loader2 size={14} className={styles.spin} aria-hidden="true" />
            Saving...
          </>
        );
      case 'saved':
        return (
          <>
            <Check size={14} aria-hidden="true" />
            Saved
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle size={14} aria-hidden="true" />
            Retry
          </>
        );
      default:
        return 'Save';
    }
  };

  return (
    <>
      <header className={styles.bar} role="banner">
        <div className={styles.left}>
          <a href="/" className={styles.logoLink} aria-label="Sketch'd home">
            <Logo size={22} />
          </a>

          {!readOnly && (
            <div className={styles.titleArea}>
              {editingTitle ? (
                <input
                  ref={inputRef}
                  className={styles.titleInput}
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') {
                      setTitleValue(metadata.title);
                      setEditingTitle(false);
                    }
                  }}
                  aria-label="Drawing title"
                />
              ) : (
                <button
                  className={styles.titleButton}
                  onClick={() => setEditingTitle(true)}
                  aria-label={`Edit title: ${metadata.title}`}
                >
                  {metadata.title}
                </button>
              )}
            </div>
          )}

          {readOnly && (
            <span className={styles.viewOnly}>View only</span>
          )}
        </div>

        <div className={styles.right}>
          {!readOnly && state.saveStatus === 'saved' && (
            <span className={styles.savedBadge} aria-live="polite">
              <Check size={12} aria-hidden="true" />
              Saved
            </span>
          )}

          {!readOnly && (
            <button
              className={`${styles.saveButton} ${state.saveStatus === 'saved' ? styles.saved : ''} ${state.saveStatus === 'error' ? styles.error : ''}`}
              onClick={save}
              disabled={state.saveStatus === 'saving'}
              aria-label={state.saveStatus === 'error' ? 'Retry save' : 'Save drawing'}
            >
              {saveLabel()}
            </button>
          )}

          <button
            className={styles.shareButton}
            onClick={() => setShowShare(true)}
            aria-label="Share drawing"
          >
            Share
          </button>

          <ThemeSwitcher />
        </div>
      </header>

      {showShare && (
        <ShareDialog
          drawingId={metadata.id}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
