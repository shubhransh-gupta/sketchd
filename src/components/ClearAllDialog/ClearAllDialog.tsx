import styles from './ClearAllDialog.module.css';

interface ClearAllDialogProps {
  onConfirm: () => void;
  onClose: () => void;
  elementCount: number;
}

export function ClearAllDialog({ onConfirm, onClose, elementCount }: ClearAllDialogProps) {
  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="clear-title"
        aria-describedby="clear-desc"
        aria-modal="true"
      >
        <h2 id="clear-title" className={styles.title}>Clear entire canvas?</h2>
        <p id="clear-desc" className={styles.description}>
          This will permanently remove all {elementCount} element{elementCount === 1 ? '' : 's'} on
          the canvas. This action can be undone with <kbd>⌘Z</kbd>.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className={styles.confirm}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type="button"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
