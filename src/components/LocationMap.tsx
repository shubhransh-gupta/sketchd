import { useEffect, useRef, useState } from 'react';
import type { LocationEntry } from '../engine/types';

type Props = {
  location: LocationEntry;
  onReady?: () => void;
};

export default function LocationMap({ location, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        if (cancelled || !containerRef.current) return;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([location.latitude, location.longitude], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const icon = L.divIcon({
          className: '',
          html: '<div class="map-marker-pulse"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        L.marker([location.latitude, location.longitude], { icon })
          .addTo(map)
          .bindPopup(`<strong>${location.name}</strong><br>${location.state}, India`);

        setTimeout(() => {
          map.flyTo([location.latitude, location.longitude], 13, { duration: 0.9 });
        }, 200);

        mapRef.current = map;
        onReady?.();
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [location.id, location.latitude, location.longitude, location.name, location.state, onReady]);

  if (failed) {
    return (
      <div className="map-fallback">
        <div>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📍</div>
          <strong>{location.name}, {location.state}</strong>
          <p style={{ marginTop: '0.375rem' }}>Map unavailable. Location routing is still working.</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="map-wrap" role="img" aria-label={`Map showing ${location.name}`} />;
}
