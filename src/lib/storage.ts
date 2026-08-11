import type { DrawingDocument, DrawingMetadata } from '../types';
import { FORMAT_VERSION } from '../types';
import { generateDrawingId } from './id';

const STORAGE_PREFIX = 'sketchd:';
const DRAWINGS_INDEX_KEY = `${STORAGE_PREFIX}index`;

export type SaveResult =
  | { source: 'github'; id: string; url: string }
  | { source: 'local'; id: string; url: string; warning?: string };

function getDrawingKey(id: string): string {
  return `${STORAGE_PREFIX}drawing:${id}`;
}

export function getDrawingsIndex(): string[] {
  try {
    const raw = localStorage.getItem(DRAWINGS_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateIndex(id: string): void {
  const index = getDrawingsIndex();
  if (!index.includes(id)) {
    index.unshift(id);
    localStorage.setItem(DRAWINGS_INDEX_KEY, JSON.stringify(index.slice(0, 100)));
  }
}

export function saveDrawingLocally(doc: DrawingDocument, bumpVersion = true): void {
  if (bumpVersion) {
    doc.metadata.updatedAt = new Date().toISOString();
    doc.metadata.version += 1;
  }
  localStorage.setItem(getDrawingKey(doc.metadata.id), JSON.stringify(doc));
  updateIndex(doc.metadata.id);
}

export function loadDrawingLocally(id: string): DrawingDocument | null {
  try {
    const raw = localStorage.getItem(getDrawingKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function createNewDrawing(title = 'Untitled drawing'): DrawingDocument {
  const now = new Date().toISOString();
  const metadata: DrawingMetadata = {
    id: generateDrawingId(),
    title,
    createdAt: now,
    updatedAt: now,
    version: 1,
    formatVersion: FORMAT_VERSION,
  };

  return {
    metadata,
    elements: [],
    appState: {
      zoom: 1,
      scrollX: 0,
      scrollY: 0,
      selectedElementIds: [],
      currentTool: 'select',
      showGrid: false,
      snapToGrid: false,
      gridSize: 20,
    },
  };
}

export function createEditableCopy(source: DrawingDocument): DrawingDocument {
  const now = new Date().toISOString();
  return {
    metadata: {
      id: generateDrawingId(),
      title: `${source.metadata.title} (copy)`,
      createdAt: now,
      updatedAt: now,
      version: 1,
      formatVersion: FORMAT_VERSION,
    },
    elements: JSON.parse(JSON.stringify(source.elements)),
    appState: {
      ...source.appState,
      selectedElementIds: [],
    },
  };
}

export async function saveToGitHub(doc: DrawingDocument): Promise<SaveResult> {
  const localUrl = `${window.location.origin}/d/${doc.metadata.id}`;

  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });

    if (response.ok) {
      const data = await response.json();
      // Mirror to local cache without double version bump
      saveDrawingLocally(doc, false);
      return {
        source: 'github',
        id: data.id ?? doc.metadata.id,
        url: data.url ?? localUrl,
      };
    }

    const err = await response.json().catch(() => ({}));
    return {
      source: 'local',
      id: doc.metadata.id,
      url: localUrl,
      warning: err.error ?? 'GitHub unavailable — saved locally only',
    };
  } catch {
    return {
      source: 'local',
      id: doc.metadata.id,
      url: localUrl,
      warning: 'Offline — saved locally only',
    };
  }
}

export async function loadFromGitHub(id: string): Promise<DrawingDocument | null> {
  try {
    const response = await fetch(`/api/drawings/${encodeURIComponent(id)}`);
    if (response.ok) {
      const doc = (await response.json()) as DrawingDocument;
      saveDrawingLocally(doc, false);
      return doc;
    }
  } catch {
    // Fall through to local
  }
  return loadDrawingLocally(id);
}

export function saveTitleLocally(id: string, title: string): void {
  const doc = loadDrawingLocally(id);
  if (doc) {
    doc.metadata.title = title;
    saveDrawingLocally(doc);
  }
}

export function getCurrentDrawingId(): string | null {
  return sessionStorage.getItem(`${STORAGE_PREFIX}current`);
}

export function setCurrentDrawingId(id: string): void {
  sessionStorage.setItem(`${STORAGE_PREFIX}current`, id);
}

export function loadPendingDocument(): DrawingDocument | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}pending-doc`);
    if (!raw) return null;
    sessionStorage.removeItem(`${STORAGE_PREFIX}pending-doc`);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
