import { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'canvas' | 'element';
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFitToContent: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ContextMenu({
  x,
  y,
  type,
  onClose,
  onDelete,
  onDuplicate,
  onFitToContent,
  onZoomIn,
  onZoomOut,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const items =
    type === 'element'
      ? [
          { label: 'Duplicate', action: () => { onDuplicate(); onClose(); } },
          { label: 'Delete', action: () => { onDelete(); onClose(); }, danger: true },
          { divider: true },
          { label: 'Bring forward', action: onClose },
          { label: 'Send backward', action: onClose },
        ]
      : [
          { label: 'Select all', action: onClose },
          { divider: true },
          { label: 'Zoom in', action: () => { onZoomIn(); onClose(); } },
          { label: 'Zoom out', action: () => { onZoomOut(); onClose(); } },
          { label: 'Fit to content', action: () => { onFitToContent(); onClose(); } },
        ];

  return (
    <div
      ref={ref}
      className={styles.menu}
      style={{ left: x, top: y }}
      role="menu"
    >
      {items.map((item, i) =>
        'divider' in item && item.divider ? (
          <div key={i} className={styles.divider} role="separator" />
        ) : (
          <button
            key={i}
            className={`${styles.item} ${'danger' in item && item.danger ? styles.danger : ''}`}
            onClick={'action' in item ? item.action : undefined}
            role="menuitem"
          >
            {'label' in item ? item.label : ''}
          </button>
        ),
      )}
    </div>
  );
}
