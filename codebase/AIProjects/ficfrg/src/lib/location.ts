import type { LocationEntry } from '../engine/types';
import locationsData from '../../data/locations.json';

const locations = locationsData as LocationEntry[];

export function getAllLocations(): LocationEntry[] {
  return locations;
}

export function getLocationById(id: string): LocationEntry | null {
  return locations.find((l) => l.id === id) ?? null;
}

export function resolveLocationQuery(query: string): LocationEntry | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const byPin = locations.find((l) => l.pinCodes?.some((p) => p === q));
  if (byPin) return byPin;

  const byId = locations.find((l) => l.id === q.replace(/\s+/g, '-'));
  if (byId) return byId;

  const byName = locations.find(
    (l) =>
      l.name.toLowerCase() === q ||
      l.name.toLowerCase().includes(q) ||
      q.includes(l.name.toLowerCase()) ||
      l.aliases?.some((a) => a === q || q.includes(a)),
  );
  return byName ?? null;
}

export function findNearestLocation(lat: number, lng: number): LocationEntry | null {
  let nearest: LocationEntry | null = null;
  let minDist = Infinity;

  for (const loc of locations) {
    const d = haversine(lat, lng, loc.latitude, loc.longitude);
    if (d < minDist) {
      minDist = d;
      nearest = loc;
    }
  }

  // Only match if within ~150km of a supported city
  return minDist <= 150 ? nearest : null;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getStates(): string[] {
  return [...new Set(locations.map((l) => l.state))].sort();
}

export function getLocationsByState(state: string): LocationEntry[] {
  return locations.filter((l) => l.state === state);
}
