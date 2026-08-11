import type { DrawingDocument, DrawingMetadata } from '../types';
import { FORMAT_VERSION } from '../types';
import { generateDrawingId, getShareUrl } from './id';

const STORAGE_PREFIX = 'sketchd:';
const DRAWINGS_INDEX_KEY = `${STORAGE_PREFIX}index`;

export type SaveResult =
  | { source: 'github'; id: string; url: string }
  | { source: 'local'; id: string; url: string; warning?: string };

function getDrawingKey(id: string): string {
  return `${STORAGE_PREFIX}drawing:${id}`;
}

function rawDrawingsBase(): string | null {
  const configured = import.meta.env.VITE_DRAWINGS_RAW_BASE as string | undefined;
  return configured || 'https://raw.githubusercontent.com/shubhransh-gupta/sketchd-drawings/main/drawings';
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

async function loadFromRawGitHub(id: string): Promise<DrawingDocument | null> {
  const base = rawDrawingsBase();
  if (!base) return null;

  const safeId = id.replace(/[^a-z0-9-]/gi, '');
  const response = await fetch(`${base}/${safeId}.json`, { cache: 'no-cache' });
  if (!response.ok) return null;
  return (await response.json()) as DrawingDocument;
}

async function saveToApi(doc: DrawingDocument): Promise<SaveResult | null> {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return null;
  }

  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });

    if (response.ok) {
      const data = await response.json();
      saveDrawingLocally(doc, false);
      return {
        source: 'github',
        id: data.id ?? doc.metadata.id,
        url: data.url ?? getShareUrl(doc.metadata.id),
      };
    }
  } catch {
    // API unavailable
  }
  return null;
}

export async function saveToGitHub(doc: DrawingDocument): Promise<SaveResult> {
  const url = getShareUrl(doc.metadata.id);

  const apiResult = await saveToApi(doc);
  if (apiResult) return apiResult;

  // GitHub Pages: no serverless runtime — drawings persist locally on this device.
  // Shared links work for drawings previously saved to sketchd-drawings (via dev API).
  return {
    source: 'local',
    id: doc.metadata.id,
    url,
    warning: 'Saved on this device. Use local dev with GITHUB_TOKEN to publish shareable drawings.',
  };
}

export async function loadFromGitHub(id: string): Promise<DrawingDocument | null> {
  const local = loadDrawingLocally(id);
  if (local) return local;

  if (typeof window === 'undefined' || !window.location.hostname.endsWith('github.io')) {
    try {
      const response = await fetch(`/api/drawings/${encodeURIComponent(id)}`);
      if (response.ok) {
        const doc = (await response.json()) as DrawingDocument;
        saveDrawingLocally(doc, false);
        return doc;
      }
    } catch {
      // fall through
    }
  }

  try {
    const doc = await loadFromRawGitHub(id);
    if (doc) {
      saveDrawingLocally(doc, false);
      return doc;
    }
  } catch {
    // fall through
  }

  return null;
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
