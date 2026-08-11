import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { DrawingDocument } from '../../src/types/index.js';
import { saveDrawingToGitHub } from '../lib/github';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const doc = req.body as DrawingDocument;

    if (!doc?.metadata?.id || !Array.isArray(doc.elements)) {
      return res.status(400).json({ error: 'Invalid drawing document' });
    }

    const result = await saveDrawingToGitHub(doc);
    return res.status(200).json({
      success: true,
      id: result.id,
      url: result.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Save failed';
    console.error('[api/save]', message);
    return res.status(503).json({ error: message });
  }
}
