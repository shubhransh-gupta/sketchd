import { useEffect, useState } from 'react';
import { useDrawing } from '../context/drawing-context-value';

const TOOL_SHORTCUTS: Record<string, import('../types').ToolType> = {
  v: 'select',
  h: 'hand',
  r: 'rectangle',
  d: 'diamond',
  o: 'ellipse',
  a: 'arrow',
  l: 'line',
  p: 'freedraw',
  t: 'text',
  i: 'image',
};

interface UseKeyboardOptions {
  onCommandPalette: () => void;
  readOnly?: boolean;
}

export function useKeyboard({ onCommandPalette, readOnly = false }: UseKeyboardOptions) {
  const { setTool, undo, redo, deleteSelected, save, setAppState } = useDrawing();
  const [konamiIndex, setKonamiIndex] = useState(0);

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Konami code easter egg
      if (e.key === KONAMI[konamiIndex]) {
        const next = konamiIndex + 1;
        if (next === KONAMI.length) {
          setKonamiIndex(0);
          // Developer mode activated toast would go here
        } else {
          setKonamiIndex(next);
        }
      } else {
        setKonamiIndex(0);
      }

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'k') {
        e.preventDefault();
        onCommandPalette();
        return;
      }

      if (readOnly) return;

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (mod && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      if (mod && e.key === 's') {
        e.preventDefault();
        save();
        return;
      }

      if (e.code === 'Delete' || e.code === 'Backspace' || e.key === 'Delete' || e.key === 'Backspace') {
        if (!mod) {
          e.preventDefault();
          deleteSelected();
        }
        return;
      }

      if (e.key === 'Escape') {
        setAppState({ selectedElementIds: [] });
        return;
      }

      if (!mod && !e.altKey && TOOL_SHORTCUTS[e.key.toLowerCase()]) {
        setTool(TOOL_SHORTCUTS[e.key.toLowerCase()]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setTool, undo, redo, deleteSelected, save, setAppState,
    onCommandPalette, readOnly, konamiIndex,
  ]);

  useEffect(() => {
    const handleOnline = () => {
      // Could dispatch online status
    };
    const handleOffline = () => {
      // Could show offline toast
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
