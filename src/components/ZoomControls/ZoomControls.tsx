import { Minus, Plus, Maximize2 } from 'lucide-react';
import { useDrawing } from '../../context/drawing-context-value';
import { getElementsBounds } from '../../lib/canvas';
import styles from './ZoomControls.module.css';

export function ZoomControls() {
  const { state, setAppState } = useDrawing();
  const { zoom } = state.document.appState;

  const zoomIn = () => setAppState({ zoom: Math.min(zoom * 1.2, 5) });
  const zoomOut = () => setAppState({ zoom: Math.max(zoom / 1.2, 0.1) });

  const fitToContent = () => {
    const bounds = getElementsBounds(state.document.elements);
    if (!bounds) {
      setAppState({ zoom: 1, scrollX: 0, scrollY: 0 });
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 80;
    const scaleX = (vw - padding * 2) / bounds.width;
    const scaleY = (vh - padding * 2) / bounds.height;
    const newZoom = Math.min(scaleX, scaleY, 2);
    setAppState({
      zoom: newZoom,
      scrollX: (vw - bounds.width * newZoom) / 2 - bounds.x * newZoom,
      scrollY: (vh - bounds.height * newZoom) / 2 - bounds.y * newZoom,
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={styles.controls} role="group" aria-label="Zoom controls">
      <button className={styles.button} onClick={zoomOut} aria-label="Zoom out">
        <Minus size={16} />
      </button>
      <button
        className={styles.zoomLabel}
        onClick={() => setAppState({ zoom: 1, scrollX: 0, scrollY: 0 })}
        aria-label={`Current zoom ${Math.round(zoom * 100)}%, click to reset`}
      >
        {Math.round(zoom * 100)}%
      </button>
      <button className={styles.button} onClick={zoomIn} aria-label="Zoom in">
        <Plus size={16} />
      </button>
      <div className={styles.divider} />
      <button className={styles.button} onClick={fitToContent} aria-label="Fit to content">
        <Maximize2 size={16} />
      </button>
      <button className={styles.button} onClick={toggleFullscreen} aria-label="Toggle fullscreen">
        ⛶
      </button>
    </div>
  );
}
