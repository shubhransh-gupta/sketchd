import {
  MousePointer2,
  Hand,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image,
} from 'lucide-react';
import type { ToolType } from '../../types';
import { useDrawing } from '../../context/drawing-context-value';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './Toolbar.module.css';

const TOOLS: { tool: ToolType; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
  { tool: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { tool: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { tool: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { tool: 'diamond', icon: Diamond, label: 'Diamond', shortcut: 'D' },
  { tool: 'ellipse', icon: Circle, label: 'Ellipse', shortcut: 'O' },
  { tool: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
  { tool: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { tool: 'freedraw', icon: Pencil, label: 'Draw', shortcut: 'P' },
  { tool: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { tool: 'image', icon: Image, label: 'Image', shortcut: 'I' },
];

export function Toolbar() {
  const { state, setTool } = useDrawing();
  const currentTool = state.document.appState.currentTool;

  const primaryTools = TOOLS.slice(0, 2);
  const shapeTools = TOOLS.slice(2, 9);
  const extraTools = TOOLS.slice(9);

  return (
    <nav className={styles.toolbar} aria-label="Drawing tools">
      <div className={styles.group}>
        {primaryTools.map(({ tool, icon: Icon, label, shortcut }) => (
          <Tooltip key={tool} content={label} shortcut={shortcut}>
            <button
              className={`${styles.tool} ${currentTool === tool ? styles.active : ''}`}
              onClick={() => setTool(tool)}
              aria-label={label}
              aria-pressed={currentTool === tool}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </Tooltip>
        ))}
      </div>

      <div className={styles.divider} role="separator" />

      <div className={styles.group}>
        {shapeTools.map(({ tool, icon: Icon, label, shortcut }) => (
          <Tooltip key={tool} content={label} shortcut={shortcut}>
            <button
              className={`${styles.tool} ${currentTool === tool ? styles.active : ''}`}
              onClick={() => setTool(tool)}
              aria-label={label}
              aria-pressed={currentTool === tool}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </Tooltip>
        ))}
      </div>

      <div className={styles.divider} role="separator" />

      <div className={styles.group}>
        {extraTools.map(({ tool, icon: Icon, label, shortcut }) => (
          <Tooltip key={tool} content={label} shortcut={shortcut}>
            <button
              className={`${styles.tool} ${currentTool === tool ? styles.active : ''}`}
              onClick={() => setTool(tool)}
              aria-label={label}
              aria-pressed={currentTool === tool}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </Tooltip>
        ))}
      </div>
    </nav>
  );
}
