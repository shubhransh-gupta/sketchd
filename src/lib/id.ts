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

export function getShareUrl(id: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://sketchd.dev';
  return `${base}/d/${id}`;
}
