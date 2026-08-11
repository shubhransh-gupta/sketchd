import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useDrawing } from '../../context/drawing-context-value';
import { useTheme } from '../../context/ThemeContext';
import { modKey, shiftKey } from '../../lib/canvas';
import styles from './CommandPalette.module.css';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  keywords: string[];
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { setTool, save, undo, redo } = useDrawing();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'rect', label: 'Rectangle', shortcut: 'R', keywords: ['rectangle', 'box', 'shape'], action: () => setTool('rectangle') },
    { id: 'arrow', label: 'Arrow', shortcut: 'A', keywords: ['arrow', 'line'], action: () => setTool('arrow') },
    { id: 'text', label: 'Text', shortcut: 'T', keywords: ['text', 'label'], action: () => setTool('text') },
    { id: 'draw', label: 'Draw', shortcut: 'P', keywords: ['draw', 'pen', 'pencil', 'freehand'], action: () => setTool('freedraw') },
    { id: 'select', label: 'Select', shortcut: 'V', keywords: ['select', 'pointer'], action: () => setTool('select') },
    { id: 'undo', label: 'Undo', shortcut: `${modKey()} Z`, keywords: ['undo'], action: undo },
    { id: 'redo', label: 'Redo', shortcut: `${modKey()} ${shiftKey()} Z`, keywords: ['redo'], action: redo },
    { id: 'save', label: 'Save', keywords: ['save', 'github'], action: () => save() },
    { id: 'dark', label: 'Toggle dark mode', keywords: ['dark', 'theme', 'mode', 'light'], action: () => setTheme('dark') },
    { id: 'light', label: 'Light mode', keywords: ['light', 'theme'], action: () => setTheme('light') },
    { id: 'ellipse', label: 'Ellipse', shortcut: 'O', keywords: ['ellipse', 'circle', 'oval'], action: () => setTool('ellipse') },
    { id: 'diamond', label: 'Diamond', shortcut: 'D', keywords: ['diamond', 'rhombus'], action: () => setTool('diamond') },
    { id: 'line', label: 'Line', shortcut: 'L', keywords: ['line'], action: () => setTool('line') },
    { id: 'hand', label: 'Hand', shortcut: 'H', keywords: ['hand', 'pan'], action: () => setTool('hand') },
  ];

  const filtered = query
    ? commands.filter((cmd) =>
        cmd.keywords.some((k) => k.includes(query.toLowerCase())) ||
        cmd.label.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const execute = (cmd: Command) => {
    cmd.action();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      execute(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.palette}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search commands"
          />
        </div>

        <ul className={styles.list} role="listbox">
          {filtered.map((cmd, i) => (
            <li key={cmd.id} role="option" aria-selected={i === selectedIndex}>
              <button
                className={`${styles.item} ${i === selectedIndex ? styles.selected : ''}`}
                onClick={() => execute(cmd)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span>{cmd.label}</span>
                {cmd.shortcut && <kbd className={styles.shortcut}>{cmd.shortcut}</kbd>}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className={styles.empty}>No commands found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
