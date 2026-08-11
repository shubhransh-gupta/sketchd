import { describe, it, expect } from 'vitest';
import { generateDrawingId, getShareUrl } from '../lib/id';

describe('id utilities', () => {
  it('generates human-readable drawing IDs', () => {
    const id = generateDrawingId();
    expect(id).toMatch(/^[a-z]+-[a-z]+-\d+$/);
  });

  it('generates share URLs', () => {
    const url = getShareUrl('quiet-moon-42');
    expect(url).toContain('/d/quiet-moon-42');
  });
});

describe('storage', () => {
  it('creates new drawings with metadata', async () => {
    const { createNewDrawing } = await import('../lib/storage');
    const doc = createNewDrawing();
    expect(doc.metadata.title).toBe('Untitled drawing');
    expect(doc.metadata.formatVersion).toBe(1);
    expect(doc.elements).toEqual([]);
  });
});
