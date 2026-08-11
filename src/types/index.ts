export type ToolType =
  | 'select'
  | 'hand'
  | 'rectangle'
  | 'diamond'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'freedraw'
  | 'text'
  | 'image';

export type FillStyle = 'solid' | 'hachure' | 'cross-hatch' | 'none';

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  locked: boolean;
  groupId?: string;
  roundness?: number;
}

export interface FreedrawElement extends BaseElement {
  type: 'freedraw';
  points: Point[];
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
}

export interface LineElement extends BaseElement {
  type: 'line' | 'arrow';
  points: [Point, Point];
}

export interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'diamond' | 'ellipse';
}

export type DrawingElement =
  | FreedrawElement
  | TextElement
  | LineElement
  | ShapeElement;

export interface DrawingMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  formatVersion: number;
}

export interface DrawingDocument {
  metadata: DrawingMetadata;
  elements: DrawingElement[];
  appState: AppState;
}

export interface AppState {
  zoom: number;
  scrollX: number;
  scrollY: number;
  selectedElementIds: string[];
  currentTool: ToolType;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

export const DEFAULT_APP_STATE: AppState = {
  zoom: 1,
  scrollX: 0,
  scrollY: 0,
  selectedElementIds: [],
  currentTool: 'select',
  showGrid: false,
  snapToGrid: false,
  gridSize: 20,
};

export const STROKE_COLORS = [
  '#1e1e1e',
  '#6366f1',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

export const BACKGROUND_COLORS = [
  'transparent',
  '#fef3c7',
  '#dbeafe',
  '#dcfce7',
  '#fce7f3',
  '#f3e8ff',
  '#ffffff',
];

export const STROKE_WIDTHS = [1, 2, 4, 8];

export const FORMAT_VERSION = 1;
