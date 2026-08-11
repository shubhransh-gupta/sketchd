import type { IncomingMessage, ServerResponse } from 'node:http';
import type { DrawingDocument } from './src/types/index.js';
import { getDrawingFromGitHub, saveDrawingToGitHub, readRequestBody } from './api/lib/github.js';

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function sketchdApiMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url ?? '';

    if (url === '/api/save' && req.method === 'POST') {
      try {
        const raw = await readRequestBody(req);
        const doc = JSON.parse(raw) as DrawingDocument;

        if (!doc?.metadata?.id || !Array.isArray(doc.elements)) {
          return sendJson(res, 400, { error: 'Invalid drawing document' });
        }

        const result = await saveDrawingToGitHub(doc);
        return sendJson(res, 200, { success: true, id: result.id, url: result.url });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Save failed';
        console.warn('[dev/api/save]', message);
        return sendJson(res, 503, { error: message });
      }
    }

    const drawingMatch = url.match(/^\/api\/drawings\/([^/?]+)/);
    if (drawingMatch && req.method === 'GET') {
      try {
        const id = decodeURIComponent(drawingMatch[1]);
        const doc = await getDrawingFromGitHub(id);
        if (!doc) {
          return sendJson(res, 404, { error: 'Drawing not found' });
        }
        return sendJson(res, 200, doc);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Load failed';
        console.warn('[dev/api/drawings]', message);
        return sendJson(res, 503, { error: message });
      }
    }

    next();
  };
}
