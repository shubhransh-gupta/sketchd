import { useReducer, useCallback, useMemo, type ReactNode } from 'react';
import type {
  DrawingElement,
  DrawingDocument,
  AppState,
  ToolType,
  SaveStatus,
  ToastMessage,
} from '../types';
import { generateElementId } from '../lib/canvas';
import {
  createNewDrawing,
  saveDrawingLocally,
  saveToGitHub,
  setCurrentDrawingId,
} from '../lib/storage';
import { DrawingContext, type DrawingContextValue } from './drawing-context-value';

type DrawingAction =
  | { type: 'SET_TOOL'; tool: ToolType }
  | { type: 'ADD_ELEMENT'; element: DrawingElement }
  | { type: 'UPDATE_ELEMENT'; id: string; updates: Partial<DrawingElement> }
  | { type: 'DELETE_ELEMENTS'; ids: string[] }
  | { type: 'SELECT_ELEMENTS'; ids: string[] }
  | { type: 'SET_APP_STATE'; state: Partial<AppState> }
  | { type: 'SET_TITLE'; title: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_DOCUMENT'; doc: DrawingDocument }
  | { type: 'DUPLICATE_ELEMENTS'; ids: string[] }
  | { type: 'SET_SAVE_STATUS'; status: SaveStatus }
  | { type: 'SET_DIRTY'; isDirty: boolean }
  | { type: 'SET_INTERACTED' }
  | { type: 'SET_FIRST_SAVE'; value: boolean }
  | { type: 'SET_ONLINE'; isOnline: boolean }
  | { type: 'SET_DEVELOPER_MODE'; value: boolean }
  | { type: 'ADD_TOAST'; toast: ToastMessage }
  | { type: 'REMOVE_TOAST'; id: string };

interface DrawingState {
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

const MAX_HISTORY = 50;

function createInitialState(doc?: DrawingDocument): DrawingState {
  const document = doc ?? createNewDrawing();
  setCurrentDrawingId(document.metadata.id);
  return {
    document,
    saveStatus: 'idle',
    isDirty: false,
    history: [document.elements],
    historyIndex: 0,
    toasts: [],
    hasInteracted: false,
    isFirstSave: true,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    developerMode: false,
  };
}

function pushHistory(state: DrawingState, elements: DrawingElement[]): DrawingState {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(elements);
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return {
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
    isDirty: true,
  };
}

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'SET_TOOL':
      return {
        ...state,
        document: {
          ...state.document,
          appState: { ...state.document.appState, currentTool: action.tool },
        },
      };

    case 'ADD_ELEMENT': {
      const elements = [...state.document.elements, action.element];
      return {
        ...pushHistory(state, elements),
        document: { ...state.document, elements },
        hasInteracted: true,
      };
    }

    case 'UPDATE_ELEMENT': {
      const elements = state.document.elements.map((el) =>
        el.id === action.id ? ({ ...el, ...action.updates } as DrawingElement) : el,
      );
      return {
        ...pushHistory(state, elements),
        document: { ...state.document, elements },
      };
    }

    case 'DELETE_ELEMENTS': {
      const elements = state.document.elements.filter((el) => !action.ids.includes(el.id));
      const withHistory = pushHistory(state, elements);
      return {
        ...withHistory,
        document: {
          ...withHistory.document,
          elements,
          appState: {
            ...withHistory.document.appState,
            selectedElementIds: withHistory.document.appState.selectedElementIds.filter(
              (id) => !action.ids.includes(id),
            ),
          },
        },
      };
    }

    case 'SELECT_ELEMENTS':
      return {
        ...state,
        document: {
          ...state.document,
          appState: { ...state.document.appState, selectedElementIds: action.ids },
        },
      };

    case 'SET_APP_STATE':
      return {
        ...state,
        document: {
          ...state.document,
          appState: { ...state.document.appState, ...action.state },
        },
      };

    case 'SET_TITLE':
      return {
        ...state,
        document: {
          ...state.document,
          metadata: { ...state.document.metadata, title: action.title },
        },
        isDirty: true,
      };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        historyIndex: newIndex,
        document: { ...state.document, elements: state.history[newIndex] },
        isDirty: true,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        historyIndex: newIndex,
        document: { ...state.document, elements: state.history[newIndex] },
        isDirty: true,
      };
    }

    case 'LOAD_DOCUMENT':
      setCurrentDrawingId(action.doc.metadata.id);
      return { ...createInitialState(action.doc), isFirstSave: false };

    case 'DUPLICATE_ELEMENTS': {
      const toDuplicate = state.document.elements.filter((el) => action.ids.includes(el.id));
      const duplicates = toDuplicate.map((el) => ({
        ...JSON.parse(JSON.stringify(el)),
        id: generateElementId(),
        x: el.x + 20,
        y: el.y + 20,
      }));
      const elements = [...state.document.elements, ...duplicates];
      return {
        ...pushHistory(state, elements),
        document: {
          ...state.document,
          elements,
          appState: {
            ...state.document.appState,
            selectedElementIds: duplicates.map((d) => d.id),
          },
        },
      };
    }

    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.status };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.isDirty };
    case 'SET_INTERACTED':
      return { ...state, hasInteracted: true };
    case 'SET_FIRST_SAVE':
      return { ...state, isFirstSave: action.value };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.isOnline };
    case 'SET_DEVELOPER_MODE':
      return { ...state, developerMode: action.value };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

export function DrawingProvider({
  children,
  initialDoc,
}: {
  children: ReactNode;
  initialDoc?: DrawingDocument;
}) {
  const [state, dispatch] = useReducer(drawingReducer, initialDoc, (doc) =>
    createInitialState(doc),
  );

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    dispatch({ type: 'ADD_TOAST', toast: { ...toast, id } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), toast.duration ?? 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const save = useCallback(async () => {
    dispatch({ type: 'SET_SAVE_STATUS', status: 'saving' });
    try {
      saveDrawingLocally(state.document);
      const result = await saveToGitHub(state.document);
      dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' });
      dispatch({ type: 'SET_DIRTY', isDirty: false });

      if (result.source === 'github') {
        if (state.isFirstSave) {
          dispatch({ type: 'SET_FIRST_SAVE', value: false });
          addToast({
            type: 'success',
            title: 'Your drawing is now on GitHub',
            description: 'Share it with anyone — no account required.',
            duration: 5000,
          });
        } else {
          addToast({
            type: 'success',
            title: 'Saved to GitHub',
            description: 'No account required.',
            duration: 3000,
          });
        }
      } else {
        addToast({
          type: 'warning',
          title: 'Saved locally',
          description: result.warning ?? 'GitHub sync unavailable.',
          duration: 4000,
        });
      }

      setTimeout(() => dispatch({ type: 'SET_SAVE_STATUS', status: 'idle' }), 2000);
    } catch {
      dispatch({ type: 'SET_SAVE_STATUS', status: 'error' });
      addToast({ type: 'error', title: "Couldn't save", description: 'Try again', duration: 4000 });
    }
  }, [state.document, state.isFirstSave, addToast]);

  const value = useMemo<DrawingContextValue>(
    () => ({
      state,
      setTool: (tool) => dispatch({ type: 'SET_TOOL', tool }),
      addElement: (element) => dispatch({ type: 'ADD_ELEMENT', element }),
      updateElement: (id, updates) => dispatch({ type: 'UPDATE_ELEMENT', id, updates }),
      deleteSelected: () => {
        const ids = state.document.appState.selectedElementIds;
        if (ids.length) dispatch({ type: 'DELETE_ELEMENTS', ids });
      },
      selectElements: (ids) => dispatch({ type: 'SELECT_ELEMENTS', ids }),
      setAppState: (appState) => dispatch({ type: 'SET_APP_STATE', state: appState }),
      setTitle: (title) => dispatch({ type: 'SET_TITLE', title }),
      undo: () => dispatch({ type: 'UNDO' }),
      redo: () => dispatch({ type: 'REDO' }),
      save,
      addToast,
      removeToast,
      duplicateSelected: () => {
        const ids = state.document.appState.selectedElementIds;
        if (ids.length) dispatch({ type: 'DUPLICATE_ELEMENTS', ids });
      },
      loadDocument: (doc) => dispatch({ type: 'LOAD_DOCUMENT', doc }),
    }),
    [state, save, addToast, removeToast],
  );

  return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>;
}

export { useDrawing } from './drawing-context-value';
