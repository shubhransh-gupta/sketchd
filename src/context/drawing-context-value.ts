import { createContext, useContext } from 'react';
import type {
  DrawingElement,
  DrawingDocument,
  AppState,
  ToolType,
  SaveStatus,
  ToastMessage,
} from '../types';

export interface DrawingState {
  document: DrawingDocument;
  saveStatus: SaveStatus;
  isDirty: boolean;
  history: DrawingElement[][];
  historyIndex: number;
  toasts: ToastMessage[];
  hasInteracted: boolean;
  isFirstSave: boolean;
  isOnline: boolean;
  developerMode: boolean;
}

export interface DrawingContextValue {
  state: DrawingState;
  setTool: (tool: ToolType) => void;
  addElement: (element: DrawingElement) => void;
  updateElement: (id: string, updates: Partial<DrawingElement>) => void;
  deleteSelected: () => void;
  selectElements: (ids: string[]) => void;
  setAppState: (state: Partial<AppState>) => void;
  setTitle: (title: string) => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<void>;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  duplicateSelected: () => void;
  loadDocument: (doc: DrawingDocument) => void;
  clearAll: () => void;
}

export const DrawingContext = createContext<DrawingContextValue | null>(null);

export function useDrawing(): DrawingContextValue {
  const ctx = useContext(DrawingContext);
  if (!ctx) throw new Error('useDrawing must be used within DrawingProvider');
  return ctx;
}
