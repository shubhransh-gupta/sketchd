export interface Env {
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH?: string;
  SITE_URL?: string;
  ALLOWED_ORIGIN?: string;
}

interface DrawingDocument {
  metadata: { id: string; title: string; [key: string]: unknown };
  elements: unknown[];
  appState?: unknown;
}

interface GitHubContentResponse {
  sha: string;
  content: string;
}

function corsHeaders(env: Env, request: Request): HeadersInit {
  const origin = request.headers.get('Origin') || '';
  const allowed = env.ALLOWED_ORIGIN || '*';
  const allowOrigin =
    allowed === '*' || origin === allowed || origin.endsWith('.github.io')
      ? origin || '*'
      : allowed;

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function drawingPath(id: string): string {
  return `drawings/${id}.json`;
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function decodeBase64(content: string): string {
  const binary = atob(content.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function githubFetch(env: Env, path: string, init?: RequestInit): Promise<Response> {
  const [owner, repo] = env.GITHUB_REPO.split('/');
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...init?.headers,
    },
  });
}

async function getDrawing(env: Env, id: string): Promise<DrawingDocument | null> {
  const safeId = id.replace(/[^a-z0-9-]/gi, '');
  if (!safeId) return null;

  const response = await githubFetch(env, drawingPath(safeId), { method: 'GET' });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub GET failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as GitHubContentResponse;
  return JSON.parse(decodeBase64(data.content)) as DrawingDocument;
}

async function saveDrawing(env: Env, doc: DrawingDocument): Promise<{ id: string; url: string }> {
  const id = doc.metadata.id.replace(/[^a-z0-9-]/gi, '');
  const path = drawingPath(id);
  const branch = env.GITHUB_BRANCH || 'main';
  const content = encodeBase64(JSON.stringify({ ...doc, metadata: { ...doc.metadata, id } }, null, 2));

  let sha: string | undefined;
  const existing = await githubFetch(env, path, { method: 'GET' });
  if (existing.ok) {
    const data = (await existing.json()) as GitHubContentResponse;
    sha = data.sha;
  }

  const body: Record<string, string> = {
    message: `Save drawing: ${doc.metadata.title} (${id})`,
    content,
    branch,
  };
  if (sha) body.sha = sha;

  const response = await githubFetch(env, path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`GitHub PUT failed: ${response.status} ${await response.text()}`);
  }

  const siteUrl = env.SITE_URL || 'https://shubhransh-gupta.github.io/sketchd';
  return { id, url: `${siteUrl}/d/${id}` };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(env, request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === '/api/save' && request.method === 'POST') {
        if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
          return json({ error: 'Save API not configured' }, 503, cors);
        }

        const doc = (await request.json()) as DrawingDocument;
        if (!doc?.metadata?.id || !Array.isArray(doc.elements)) {
          return json({ error: 'Invalid drawing document' }, 400, cors);
        }

        const result = await saveDrawing(env, doc);
        return json({ success: true, ...result }, 200, cors);
      }

      const drawingMatch = url.pathname.match(/^\/api\/drawings\/([^/]+)$/);
      if (drawingMatch && request.method === 'GET') {
        if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
          return json({ error: 'Load API not configured' }, 503, cors);
        }

        const id = decodeURIComponent(drawingMatch[1]);
        const doc = await getDrawing(env, id);
        if (!doc) return json({ error: 'Drawing not found' }, 404, cors);
        return json(doc, 200, { ...cors, 'Cache-Control': 'public, max-age=60' });
      }

      if (url.pathname === '/api/health') {
        return json({ ok: true, repo: env.GITHUB_REPO }, 200, cors);
      }

      return json({ error: 'Not found' }, 404, cors);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Server error';
      console.error('[sketchd-api]', message);
      return json({ error: message }, 503, cors);
    }
  },
};
