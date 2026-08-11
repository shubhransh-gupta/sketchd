import { Check, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useDrawing } from '../../context/drawing-context-value';
import styles from './Toast.module.css';

const ICONS = {
  success: Check,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export function ToastContainer() {
  const { state, removeToast } = useDrawing();

  if (state.toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {state.toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`} role="alert">
            <Icon size={16} className={styles.icon} aria-hidden="true" />
            <div className={styles.content}>
              <p className={styles.title}>{toast.title}</p>
              {toast.description && (
                <p className={styles.description}>{toast.description}</p>
              )}
            </div>
            <button
              className={styles.close}
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
