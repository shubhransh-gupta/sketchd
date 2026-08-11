import {
  MousePointer2,
  Pencil,
  Type,
  Square,
  MoreHorizontal,
} from 'lucide-react';
import type { ToolType } from '../../types';
import { useDrawing } from '../../context/drawing-context-value';
import styles from './MobileToolbar.module.css';

const MOBILE_TOOLS: { tool: ToolType; icon: typeof MousePointer2; label: string }[] = [
  { tool: 'select', icon: MousePointer2, label: 'Select' },
  { tool: 'freedraw', icon: Pencil, label: 'Draw' },
  { tool: 'text', icon: Type, label: 'Text' },
  { tool: 'rectangle', icon: Square, label: 'Shape' },
];

export function MobileToolbar() {
  const { state, setTool } = useDrawing();
  const currentTool = state.document.appState.currentTool;

  return (
    <nav className={styles.toolbar} aria-label="Mobile drawing tools">
      {MOBILE_TOOLS.map(({ tool, icon: Icon, label }) => (
        <button
          key={tool}
          className={`${styles.tool} ${currentTool === tool ? styles.active : ''}`}
          onClick={() => setTool(tool)}
          aria-label={label}
          aria-pressed={currentTool === tool}
        >
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
      <button className={styles.tool} aria-label="More tools">
        <MoreHorizontal size={20} aria-hidden="true" />
        <span className={styles.label}>More</span>
      </button>
    </nav>
  );
}
