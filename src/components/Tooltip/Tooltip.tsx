import { useState, useRef, useEffect, type ReactNode } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  shortcut?: string;
  delay?: number;
  children: ReactNode;
}

export function Tooltip({ content, shortcut, delay = 600, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className={styles.wrapper} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div className={styles.tooltip} role="tooltip">
          <span>{content}</span>
          {shortcut && <kbd className={styles.shortcut}>{shortcut}</kbd>}
        </div>
      )}
    </div>
  );
}
