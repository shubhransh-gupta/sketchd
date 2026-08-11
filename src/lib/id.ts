const ADJECTIVES = [
  'quiet', 'swift', 'calm', 'bright', 'soft', 'bold', 'neat', 'warm',
  'cool', 'deep', 'light', 'quick', 'still', 'wild', 'pure', 'clear',
];

const NOUNS = [
  'moon', 'star', 'wave', 'cloud', 'leaf', 'stone', 'river', 'peak',
  'dawn', 'dusk', 'wind', 'rain', 'snow', 'fire', 'tree', 'bird',
];

export function generateDrawingId(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}-${noun}-${num}`;
}

export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8);
}

function siteOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  return configured || 'https://shubhransh-gupta.github.io';
}

function siteBasePath(): string {
  if (typeof window !== 'undefined') {
    return import.meta.env.BASE_URL.replace(/\/$/, '');
  }
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  if (configured?.includes('.github.io/')) {
    return '/sketchd';
  }
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}

export function getShareUrl(id: string): string {
  const base = siteBasePath();
  return `${siteOrigin()}${base}/d/${id}`;
}

export function isGitHubPages(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
}
