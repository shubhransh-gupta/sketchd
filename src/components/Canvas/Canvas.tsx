import { useRef, useEffect, useCallback, useState } from 'react';
import type { DrawingElement, Point, AppState } from '../../types';
import { useDrawing } from '../../context/drawing-context-value';
import {
  renderScene,
  screenToCanvas,
  canvasToScreen,
  hitTestElement,
  generateElementId,
  getElementsBounds,
  snapToGrid,
  getDefaultStrokeColor,
} from '../../lib/canvas';
import { subscribeImageLoads, preloadImages } from '../../lib/imageCache';
import { EmptyState } from '../EmptyState/EmptyState';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import styles from './Canvas.module.css';

interface ContextMenuState {
  x: number;
  y: number;
  type: 'canvas' | 'element';
}

interface TextInputState {
  screenX: number;
  screenY: number;
  canvasX: number;
  canvasY: number;
}

export function Canvas({ readOnly = false }: { readOnly?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appStateRef = useRef<AppState>({
    zoom: 1,
    scrollX: 0,
    scrollY: 0,
    selectedElementIds: [],
    currentTool: 'select' as AppState['currentTool'],
    showGrid: false,
    snapToGrid: false,
    gridSize: 20,
  });
  const pendingImagePoint = useRef<Point | null>(null);
  const textValueRef = useRef('');

  const {
    state,
    addElement,
    setAppState,
    deleteSelected,
    duplicateSelected,
    deleteElements,
  } = useDrawing();

  const { elements, appState } = state.document;
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [textInput, setTextInput] = useState<TextInputState | null>(null);
  const [, bumpRender] = useState(0);

  appStateRef.current = appState;

  useEffect(() => {
    const urls = elements
      .filter((el): el is DrawingElement & { type: 'image'; dataUrl: string } => el.type === 'image')
      .map((el) => el.dataUrl);
    preloadImages(urls);
    return subscribeImageLoads(() => bumpRender((n) => n + 1));
  }, [elements]);

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

    const css = getComputedStyle(document.documentElement);
    renderScene(
      ctx,
      elements,
      appState,
      rect.width,
      rect.height,
      css.getPropertyValue('--grid-color').trim(),
      css.getPropertyValue('--selection-color').trim(),
      css.getPropertyValue('--selection-handle').trim(),
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

  // Touchpad / mouse wheel: pinch-to-zoom + two-finger pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const current = appStateRef.current;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Trackpad pinch sends wheel + ctrlKey; mouse wheel zoom with ctrl/cmd
      const isZoom = e.ctrlKey || e.metaKey;

      if (isZoom) {
        const delta = -e.deltaY * 0.008;
        const newZoom = Math.min(Math.max(current.zoom * (1 + delta), 0.1), 5);
        const ratio = newZoom / current.zoom;
        setAppState({
          zoom: newZoom,
          scrollX: mouseX - (mouseX - current.scrollX) * ratio,
          scrollY: mouseY - (mouseY - current.scrollY) * ratio,
        });
      } else {
        setAppState({
          scrollX: current.scrollX - e.deltaX,
          scrollY: current.scrollY - e.deltaY,
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [setAppState]);

  const getCanvasPoint = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
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
      strokeColor: getDefaultStrokeColor(),
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

  const openTextInput = (point: Point) => {
    const screen = canvasToScreen(point.x, point.y, appState);
    textValueRef.current = '';
    setTextInput({
      screenX: screen.x,
      screenY: screen.y,
      canvasX: point.x,
      canvasY: point.y,
    });
  };

  const handleTextSubmit = () => {
    const text = textValueRef.current.trim();
    if (text && textInput) {
      addElement({
        id: generateElementId(),
        type: 'text',
        x: textInput.canvasX,
        y: textInput.canvasY,
        width: 200,
        height: 30,
        angle: 0,
        text,
        fontSize: 20,
        fontFamily: 'DM Sans, sans-serif',
        strokeColor: getDefaultStrokeColor(),
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
        roughness: 0,
        opacity: 1,
        locked: false,
      });
    }
    setTextInput(null);
    textValueRef.current = '';
  };

  const placeImage = (dataUrl: string, point: Point) => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 480;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxSize || h > maxSize) {
        const scale = maxSize / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      addElement({
        id: generateElementId(),
        type: 'image',
        x: point.x,
        y: point.y,
        width: w,
        height: h,
        angle: 0,
        dataUrl,
        strokeColor: 'transparent',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 0,
        roughness: 0,
        opacity: 1,
        locked: false,
      });
      bumpRender((n) => n + 1);
    };
    img.src = dataUrl;
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const point = pendingImagePoint.current;
    e.target.value = '';
    pendingImagePoint.current = null;

    if (!file || !point) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        placeImage(reader.result, point);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (textInput) return;

    if (readOnly) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }

    setContextMenu(null);
    const point = getCanvasPoint(e.clientX, e.clientY);
    const tool = appState.currentTool;

    if (tool === 'hand' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }

    if (tool === 'select') {
      const hit = [...elements].reverse().find((el) => hitTestElement(el, point));
      if (hit) {
        deleteElements([hit.id]);
      }
      return;
    }

    if (tool === 'text') {
      e.preventDefault();
      openTextInput(point);
      return;
    }

    if (tool === 'image') {
      pendingImagePoint.current = point;
      fileInputRef.current?.click();
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoints([point]);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
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
    const point = getCanvasPoint(e.clientX, e.clientY);
    setCurrentPoints((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.hypot(point.x - last.x, point.y - last.y) < 1.5) return prev;
      return [...prev, point];
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (!isDrawing || !startPoint) {
      setIsDrawing(false);
      return;
    }

    const point = getCanvasPoint(e.clientX, e.clientY);
    const tool = appState.currentTool;

    if (tool === 'freedraw' && currentPoints.length > 1) {
      const el = createElement(startPoint, point);
      if (el) addElement(el);
    } else if (
      tool !== 'freedraw' &&
      tool !== 'select' &&
      tool !== 'hand' &&
      tool !== 'text' &&
      tool !== 'image'
    ) {
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

  const textFontSize = 20 * appState.zoom;

  return (
    <div ref={containerRef} className={`${styles.container} ${cursorClass}`}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={handleContextMenu}
        aria-label="Drawing canvas"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
        className={styles.hiddenInput}
        onChange={handleImageFile}
        aria-hidden="true"
        tabIndex={-1}
      />

      {!readOnly && elements.length === 0 && !state.hasInteracted && <EmptyState />}

      {textInput && (
        <textarea
          className={styles.textInput}
          style={{
            left: textInput.screenX,
            top: textInput.screenY,
            fontSize: textFontSize,
            minWidth: 160 * appState.zoom,
          }}
          autoFocus
          rows={1}
          placeholder="Type here…"
          defaultValue=""
          onChange={(e) => {
            textValueRef.current = e.target.value;
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape') {
              setTextInput(null);
              textValueRef.current = '';
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleTextSubmit();
            }
          }}
          onBlur={() => {
            // Delay so Enter key submit completes first
            setTimeout(handleTextSubmit, 0);
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
