import { useRef, useEffect, useCallback, useState } from 'react';
import type { DrawingElement, Point } from '../../types';
import { useDrawing } from '../../context/drawing-context-value';
import {
  renderScene,
  screenToCanvas,
  hitTestElement,
  generateElementId,
  getElementsBounds,
  snapToGrid,
} from '../../lib/canvas';
import { EmptyState } from '../EmptyState/EmptyState';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import styles from './Canvas.module.css';

interface ContextMenuState {
  x: number;
  y: number;
  type: 'canvas' | 'element';
}

export function Canvas({ readOnly = false }: { readOnly?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    state,
    addElement,
    selectElements,
    setAppState,
    deleteSelected,
    duplicateSelected,
  } = useDrawing();

  const { elements, appState } = state.document;
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const styles = getComputedStyle(document.documentElement);
    renderScene(
      ctx,
      elements,
      appState,
      rect.width,
      rect.height,
      styles.getPropertyValue('--grid-color').trim(),
      styles.getPropertyValue('--selection-color').trim(),
      styles.getPropertyValue('--selection-handle').trim(),
    );

    if (isDrawing && startPoint && currentPoints.length > 0) {
      ctx.save();
      ctx.translate(appState.scrollX, appState.scrollY);
      ctx.scale(appState.zoom, appState.zoom);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      const tool = appState.currentTool;
      if (tool === 'freedraw') {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (startPoint) {
        const last = currentPoints[currentPoints.length - 1] || startPoint;
        const x = Math.min(startPoint.x, last.x);
        const y = Math.min(startPoint.y, last.y);
        const w = Math.abs(last.x - startPoint.x);
        const h = Math.abs(last.y - startPoint.y);

        if (tool === 'rectangle') {
          ctx.strokeRect(x, y, w, h);
        } else if (tool === 'ellipse') {
          ctx.beginPath();
          ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (tool === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(x + w / 2, y);
          ctx.lineTo(x + w, y + h / 2);
          ctx.lineTo(x + w / 2, y + h);
          ctx.lineTo(x, y + h / 2);
          ctx.closePath();
          ctx.stroke();
        } else if (tool === 'line' || tool === 'arrow') {
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(last.x, last.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }, [elements, appState, isDrawing, startPoint, currentPoints]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const handleResize = () => render();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return screenToCanvas(clientX, clientY, appState, rect);
  };

  const createElement = (start: Point, end: Point): DrawingElement | null => {
    const tool = appState.currentTool;
    const base = {
      id: generateElementId(),
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
      angle: 0,
      strokeColor: '#1e1e1e',
      backgroundColor: 'transparent',
      fillStyle: 'solid' as const,
      strokeWidth: 2,
      roughness: 1,
      opacity: 1,
      locked: false,
    };

    const snap = (v: number) => snapToGrid(v, appState.gridSize, appState.snapToGrid);

    switch (tool) {
      case 'rectangle':
        return { ...base, type: 'rectangle', x: snap(base.x), y: snap(base.y), roundness: 0 };
      case 'diamond':
        return { ...base, type: 'diamond', x: snap(base.x), y: snap(base.y) };
      case 'ellipse':
        return { ...base, type: 'ellipse', x: snap(base.x), y: snap(base.y) };
      case 'line':
        return { ...base, type: 'line', points: [start, end] };
      case 'arrow':
        return { ...base, type: 'arrow', points: [start, end] };
      case 'freedraw':
        return { ...base, type: 'freedraw', points: currentPoints };
      default:
        return null;
    }
  };

  const handlePointerDown = (e: React.MouseEvent) => {
    if (readOnly) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    setContextMenu(null);
    const point = getCanvasPoint(e);
    const tool = appState.currentTool;

    if (tool === 'hand' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (tool === 'select') {
      const hit = [...elements].reverse().find((el) => hitTestElement(el, point));
      if (hit) {
        const ids = e.shiftKey
          ? appState.selectedElementIds.includes(hit.id)
            ? appState.selectedElementIds.filter((id) => id !== hit.id)
            : [...appState.selectedElementIds, hit.id]
          : [hit.id];
        selectElements(ids);
      } else {
        selectElements([]);
      }
      return;
    }

    if (tool === 'text') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      setTextInput({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        canvasX: point.x,
        canvasY: point.y,
      });
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoints([point]);
  };

  const handlePointerMove = (e: React.MouseEvent) => {
    if (isPanning && panStart) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setAppState({
        scrollX: appState.scrollX + dx,
        scrollY: appState.scrollY + dy,
      });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;
    const point = getCanvasPoint(e);
    setCurrentPoints((prev) => [...prev, point]);
  };

  const handlePointerUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (!isDrawing || !startPoint) {
      setIsDrawing(false);
      return;
    }

    const point = getCanvasPoint(e);
    const tool = appState.currentTool;

    if (tool === 'freedraw' && currentPoints.length > 1) {
      const el = createElement(startPoint, point);
      if (el) addElement(el);
    } else if (tool !== 'freedraw' && tool !== 'select' && tool !== 'hand' && tool !== 'text') {
      const dx = Math.abs(point.x - startPoint.x);
      const dy = Math.abs(point.y - startPoint.y);
      if (dx > 3 || dy > 3) {
        const el = createElement(startPoint, point);
        if (el) addElement(el);
      }
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoints([]);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: appState.selectedElementIds.length > 0 ? 'element' : 'canvas',
    });
  };

  const handleTextSubmit = (text: string) => {
    if (text.trim() && textInput) {
      addElement({
        id: generateElementId(),
        type: 'text',
        x: textInput.canvasX,
        y: textInput.canvasY,
        width: 200,
        height: 30,
        angle: 0,
        text: text.trim(),
        fontSize: 20,
        fontFamily: 'DM Sans, sans-serif',
        strokeColor: '#1e1e1e',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
        roughness: 0,
        opacity: 1,
        locked: false,
      });
    }
    setTextInput(null);
  };

  const fitToContent = () => {
    const bounds = getElementsBounds(elements);
    const container = containerRef.current;
    if (!bounds || !container) return;

    const rect = container.getBoundingClientRect();
    const padding = 60;
    const scaleX = (rect.width - padding * 2) / bounds.width;
    const scaleY = (rect.height - padding * 2) / bounds.height;
    const zoom = Math.min(scaleX, scaleY, 2);

    setAppState({
      zoom,
      scrollX: (rect.width - bounds.width * zoom) / 2 - bounds.x * zoom,
      scrollY: (rect.height - bounds.height * zoom) / 2 - bounds.y * zoom,
    });
  };

  const cursorClass = readOnly
    ? styles.grabbing
    : appState.currentTool === 'hand' || isPanning
      ? styles.grabbing
      : appState.currentTool === 'select'
        ? styles.default
        : styles.crosshair;

  return (
    <div ref={containerRef} className={`${styles.container} ${cursorClass}`}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onContextMenu={handleContextMenu}
        aria-label="Drawing canvas"
      />

      {!readOnly && elements.length === 0 && !state.hasInteracted && (
        <EmptyState />
      )}

      {textInput && (
        <input
          className={styles.textInput}
          style={{ left: textInput.x, top: textInput.y }}
          autoFocus
          placeholder="Type something..."
          onBlur={(e) => handleTextSubmit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTextSubmit(e.currentTarget.value);
            if (e.key === 'Escape') setTextInput(null);
          }}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onClose={() => setContextMenu(null)}
          onDelete={deleteSelected}
          onDuplicate={duplicateSelected}
          onFitToContent={fitToContent}
          onZoomIn={() => setAppState({ zoom: Math.min(appState.zoom * 1.2, 5) })}
          onZoomOut={() => setAppState({ zoom: Math.max(appState.zoom / 1.2, 0.1) })}
        />
      )}
    </div>
  );
}

export { Canvas as CanvasComponent };
