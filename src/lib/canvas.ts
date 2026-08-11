import type { DrawingElement, Point, AppState } from '../types';
import { getCachedImage } from './imageCache';

export function generateElementId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getElementBounds(el: DrawingElement): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (el.type === 'freedraw' && el.points.length > 0) {
    const xs = el.points.map((p) => p.x);
    const ys = el.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return {
      x: minX,
      y: minY,
      width: Math.max(...xs) - minX,
      height: Math.max(...ys) - minY,
    };
  }
  if (el.type === 'line' || el.type === 'arrow') {
    const [p1, p2] = el.points;
    return {
      x: Math.min(p1.x, p2.x),
      y: Math.min(p1.y, p2.y),
      width: Math.abs(p2.x - p1.x),
      height: Math.abs(p2.y - p1.y),
    };
  }
  return { x: el.x, y: el.y, width: el.width, height: el.height };
}

export function hitTestElement(el: DrawingElement, point: Point, tolerance = 10): boolean {
  if (el.type === 'line' || el.type === 'arrow') {
    const [p1, p2] = el.points;
    const padding = el.strokeWidth + tolerance;
    const minX = Math.min(p1.x, p2.x) - padding;
    const maxX = Math.max(p1.x, p2.x) + padding;
    const minY = Math.min(p1.y, p2.y) - padding;
    const maxY = Math.max(p1.y, p2.y) + padding;
    if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) return false;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(point.x - p1.x, point.y - p1.y) <= padding;
    const t = Math.max(0, Math.min(1, ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lenSq));
    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;
    return Math.hypot(point.x - projX, point.y - projY) <= padding;
  }

  if (el.type === 'freedraw' && el.points.length > 1) {
    const padding = el.strokeWidth + tolerance;
    for (let i = 1; i < el.points.length; i++) {
      const p1 = el.points[i - 1];
      const p2 = el.points[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const lenSq = dx * dx + dy * dy;
      const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lenSq));
      const projX = p1.x + t * dx;
      const projY = p1.y + t * dy;
      if (Math.hypot(point.x - projX, point.y - projY) <= padding) return true;
    }
    return false;
  }

  const bounds = getElementBounds(el);
  const padding = el.strokeWidth + tolerance;
  return (
    point.x >= bounds.x - padding &&
    point.x <= bounds.x + bounds.width + padding &&
    point.y >= bounds.y - padding &&
    point.y <= bounds.y + bounds.height + padding
  );
}

export function screenToCanvas(
  screenX: number,
  screenY: number,
  appState: AppState,
  canvasRect: DOMRect,
): Point {
  return {
    x: (screenX - canvasRect.left - appState.scrollX) / appState.zoom,
    y: (screenY - canvasRect.top - appState.scrollY) / appState.zoom,
  };
}

export function snapToGrid(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  appState: AppState,
  gridColor: string,
): void {
  if (!appState.showGrid) return;

  const { gridSize, scrollX, scrollY, zoom } = appState;
  const scaledGrid = gridSize * zoom;
  const offsetX = scrollX % scaledGrid;
  const offsetY = scrollY % scaledGrid;

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = offsetX; x < width; x += scaledGrid) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = offsetY; y < height; y += scaledGrid) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}

function drawRoughRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  roughness: number,
): void {
  const offset = roughness * 2;
  ctx.beginPath();
  ctx.moveTo(x + Math.random() * offset, y + Math.random() * offset);
  ctx.lineTo(x + w + Math.random() * offset, y + Math.random() * offset);
  ctx.lineTo(x + w + Math.random() * offset, y + h + Math.random() * offset);
  ctx.lineTo(x + Math.random() * offset, y + h + Math.random() * offset);
  ctx.closePath();
}

function drawRoughEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): void {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

function drawRoughDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x + w, cy);
  ctx.lineTo(cx, y + h);
  ctx.lineTo(x, cy);
  ctx.closePath();
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  size: number,
): void {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - size * Math.cos(angle - Math.PI / 6),
    to.y - size * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - size * Math.cos(angle + Math.PI / 6),
    to.y - size * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
}

export function renderElement(ctx: CanvasRenderingContext2D, el: DrawingElement): void {
  ctx.save();
  ctx.globalAlpha = el.opacity;
  ctx.strokeStyle = el.strokeColor;
  ctx.lineWidth = el.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (el.backgroundColor && el.backgroundColor !== 'transparent') {
    ctx.fillStyle = el.backgroundColor;
  }

  switch (el.type) {
    case 'rectangle': {
      if (el.roundness && el.roundness > 0) {
        const r = Math.min(el.roundness, el.width / 2, el.height / 2);
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width, el.height, r);
      } else {
        drawRoughRect(ctx, el.x, el.y, el.width, el.height, el.roughness);
      }
      if (el.backgroundColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }
    case 'ellipse': {
      drawRoughEllipse(ctx, el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2);
      if (el.backgroundColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }
    case 'diamond': {
      drawRoughDiamond(ctx, el.x, el.y, el.width, el.height);
      if (el.backgroundColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }
    case 'line':
    case 'arrow': {
      const [p1, p2] = el.points;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      if (el.type === 'arrow') {
        drawArrowHead(ctx, p1, p2, 12 + el.strokeWidth * 2);
      }
      break;
    }
    case 'freedraw': {
      if (el.points.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) {
        ctx.lineTo(el.points[i].x, el.points[i].y);
      }
      ctx.stroke();
      break;
    }
    case 'text': {
      ctx.font = `${el.fontSize}px ${el.fontFamily}`;
      ctx.fillStyle = el.strokeColor;
      ctx.textBaseline = 'top';
      const lines = el.text.split('\n');
      lines.forEach((line, i) => {
        ctx.fillText(line, el.x, el.y + i * el.fontSize * 1.2);
      });
      break;
    }
    case 'image': {
      const img = getCachedImage(el.dataUrl);
      if (img) {
        ctx.drawImage(img, el.x, el.y, el.width, el.height);
      } else {
        ctx.strokeStyle = '#6366f1';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(el.x, el.y, el.width, el.height);
        ctx.setLineDash([]);
      }
      break;
    }
  }

  ctx.restore();
}

export function renderSelection(
  ctx: CanvasRenderingContext2D,
  el: DrawingElement,
  selectionColor: string,
  handleColor: string,
): void {
  const bounds = getElementBounds(el);
  const padding = 4;

  ctx.save();
  ctx.strokeStyle = selectionColor;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(
    bounds.x - padding,
    bounds.y - padding,
    bounds.width + padding * 2,
    bounds.height + padding * 2,
  );
  ctx.setLineDash([]);

  const handleSize = 8;
  const handles = [
    { x: bounds.x - padding, y: bounds.y - padding },
    { x: bounds.x + bounds.width + padding, y: bounds.y - padding },
    { x: bounds.x - padding, y: bounds.y + bounds.height + padding },
    { x: bounds.x + bounds.width + padding, y: bounds.y + bounds.height + padding },
  ];

  handles.forEach((h) => {
    ctx.fillStyle = handleColor;
    ctx.strokeStyle = selectionColor;
    ctx.lineWidth = 1.5;
    ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
  });

  ctx.restore();
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  elements: DrawingElement[],
  appState: AppState,
  width: number,
  height: number,
  gridColor: string,
  selectionColor: string,
  handleColor: string,
): void {
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(appState.scrollX, appState.scrollY);
  ctx.scale(appState.zoom, appState.zoom);

  elements.forEach((el) => {
    if (!el.locked) renderElement(ctx, el);
  });
  elements.filter((el) => el.locked).forEach((el) => renderElement(ctx, el));

  appState.selectedElementIds.forEach((id) => {
    const el = elements.find((e) => e.id === id);
    if (el) renderSelection(ctx, el, selectionColor, handleColor);
  });

  ctx.restore();

  drawGrid(ctx, width, height, appState, gridColor);
}

export function getElementsBounds(elements: DrawingElement[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    const b = getElementBounds(el);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  });

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function getDefaultStrokeColor(): string {
  if (typeof document === 'undefined') return '#1e1e1e';
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() ||
    '#1e1e1e'
  );
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  appState: AppState,
): Point {
  return {
    x: canvasX * appState.zoom + appState.scrollX,
    y: canvasY * appState.zoom + appState.scrollY,
  };
}

export function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

export function modKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

export function altKey(): string {
  return isMac() ? '⌥' : 'Alt';
}

export function shiftKey(): string {
  return isMac() ? '⇧' : 'Shift';
}
