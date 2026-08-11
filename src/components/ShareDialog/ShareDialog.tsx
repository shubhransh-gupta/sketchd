import { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { getShareUrl } from '../../lib/id';
import { useDrawing } from '../../context/drawing-context-value';
import styles from './ShareDialog.module.css';

interface ShareDialogProps {
  drawingId: string;
  onClose: () => void;
}

export function ShareDialog({ drawingId, onClose }: ShareDialogProps) {
  const { addToast } = useDrawing();
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(drawingId);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast({ type: 'success', title: 'Link copied', duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({ type: 'error', title: 'Failed to copy link', duration: 3000 });
    }
  };

  const webShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sketch'd drawing",
          text: 'Check out this drawing',
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="share-title"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h2 id="share-title" className={styles.title}>Share drawing</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className={styles.description}>
          Anyone with this link can view your drawing — save to cloud first so it loads for others.
        </p>

        <div className={styles.urlBox}>
          <span className={`mono ${styles.url}`}>{shareUrl.replace(/^https?:\/\//, '')}</span>
          <button className={styles.copyIcon} onClick={copyLink} aria-label="Copy link">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <button className={styles.copyButton} onClick={copyLink}>
          {copied ? (
            <>
              <Check size={16} aria-hidden="true" />
              Link copied
            </>
          ) : (
            <>
              <Copy size={16} aria-hidden="true" />
              Copy link
            </>
          )}
        </button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button className={styles.shareNative} onClick={webShare}>
            <Share2 size={16} aria-hidden="true" />
            Share via...
          </button>
        )}

        <p className={styles.footer}>No account required.</p>
      </div>
    </div>
  );
}
