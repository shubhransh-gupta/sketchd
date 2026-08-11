const cache = new Map<string, HTMLImageElement>();
const listeners = new Set<() => void>();

export function getCachedImage(dataUrl: string, onLoad?: () => void): HTMLImageElement | null {
  const existing = cache.get(dataUrl);
  if (existing?.complete && existing.naturalWidth > 0) {
    return existing;
  }

  if (!existing) {
    const img = new Image();
    img.onload = () => {
      listeners.forEach((fn) => fn());
      onLoad?.();
    };
    img.onerror = () => onLoad?.();
    img.src = dataUrl;
    cache.set(dataUrl, img);
    return img.complete && img.naturalWidth > 0 ? img : null;
  }

  return existing.complete && existing.naturalWidth > 0 ? existing : null;
}

export function subscribeImageLoads(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function preloadImages(dataUrls: string[]): void {
  dataUrls.forEach((url) => getCachedImage(url));
}
