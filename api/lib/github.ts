import type { IncomingMessage } from 'node:http';
import type { DrawingDocument } from '../../src/types/index.js';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const repoFull = process.env.GITHUB_REPO;

  if (!token || !repoFull) return null;

  const [owner, repo] = repoFull.split('/');
  if (!owner || !repo) return null;

  return {
    token,
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

function drawingPath(id: string): string {
  return `drawings/${id}.json`;
}

function encodeContent(doc: DrawingDocument): string {
  return Buffer.from(JSON.stringify(doc, null, 2)).toString('base64');
}

interface GitHubContentResponse {
  sha: string;
  content: string;
  encoding: string;
}

async function githubFetch(
  config: GitHubConfig,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...init?.headers,
    },
  });
}

export async function getDrawingFromGitHub(id: string): Promise<DrawingDocument | null> {
  const config = getGitHubConfig();
  if (!config) return null;

  const safeId = id.replace(/[^a-z0-9-]/gi, '');
  if (!safeId) return null;

  const response = await githubFetch(config, drawingPath(safeId), {
    method: 'GET',
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GitHub GET failed: ${response.status} ${err}`);
  }

  const data = (await response.json()) as GitHubContentResponse;
  const decoded = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
  return JSON.parse(decoded) as DrawingDocument;
}

export async function saveDrawingToGitHub(
  doc: DrawingDocument,
): Promise<{ id: string; url: string }> {
  const config = getGitHubConfig();
  if (!config) {
    throw new Error('GitHub is not configured. Set GITHUB_TOKEN and GITHUB_REPO.');
  }

  const id = doc.metadata.id.replace(/[^a-z0-9-]/gi, '');
  const path = drawingPath(id);
  const payload = {
    message: `Save drawing: ${doc.metadata.title} (${id})`,
    content: encodeContent({ ...doc, metadata: { ...doc.metadata, id } }),
    branch: config.branch,
  };

  let sha: string | undefined;
  const existing = await githubFetch(config, path, { method: 'GET' });
  if (existing.ok) {
    const data = (await existing.json()) as GitHubContentResponse;
    sha = data.sha;
  }

  const response = await githubFetch(config, path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sha ? { ...payload, sha } : payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GitHub PUT failed: ${response.status} ${err}`);
  }

  const siteUrl = process.env.SITE_URL || 'https://shubhransh-gupta.github.io/sketchd';
  return { id, url: `${siteUrl}/d/${id}` };
}

export async function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}
