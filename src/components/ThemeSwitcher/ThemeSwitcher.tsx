import { Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './ThemeSwitcher.module.css';

const THEMES = [
  { mode: 'system' as const, icon: Monitor, label: 'System' },
  { mode: 'light' as const, icon: Sun, label: 'Light' },
  { mode: 'dark' as const, icon: Moon, label: 'Dark' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.switcher} role="group" aria-label="Theme">
      {THEMES.map(({ mode, icon: Icon, label }) => (
        <Tooltip key={mode} content={label} delay={400}>
          <button
            className={`${styles.button} ${theme === mode ? styles.active : ''}`}
            onClick={() => setTheme(mode)}
            aria-label={`${label} theme`}
            aria-pressed={theme === mode}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
