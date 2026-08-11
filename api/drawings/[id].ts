import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { DrawingDocument } from '../../src/types/index.js';
import { saveDrawingToGitHub, getDrawingFromGitHub } from '../lib/github';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ error: 'Missing drawing id' });
  }

  try {
    const doc = await getDrawingFromGitHub(id);
    if (!doc) {
      return res.status(404).json({ error: 'Drawing not found' });
    }
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(doc);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Load failed';
    console.error('[api/drawings]', message);
    return res.status(503).json({ error: message });
  }
}
