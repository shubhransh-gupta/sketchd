import styles from './EmptyState.module.css';

export function EmptyState() {
  return (
    <div className={styles.empty} aria-hidden="true">
      <p className={styles.title}>Start drawing</p>
      <p className={styles.subtitle}>No account required.</p>
      <p className={styles.hints}>
        Press <kbd>R</kbd> for rectangles · <kbd>T</kbd> for text · <kbd>A</kbd> for arrows
      </p>
    </div>
  );
}
