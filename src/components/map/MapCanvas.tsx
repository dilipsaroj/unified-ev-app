'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { Map, AdvancedMarker, APIProvider, useMap } from '@vis.gl/react-google-maps';
import { useMapStore } from '@/stores/mapStore';
import { StationPin } from '@/components/station/StationPin';
import type { Station } from '@/lib/data/types';
import type { ReliabilityTier } from '@/lib/data/types';

interface Props {
  stations: Station[];
  apiKey: string;
  onSelectStation: (id: string) => void;
}

function primaryConnectorLetter(station: Station): 'D' | 'A' {
  const hasDC = station.connectors?.some(
    (c) => c.type === 'CCS_2' || c.type === 'CHADEMO' || c.type === 'BHARAT_DC_001',
  );
  return hasDC ? 'D' : 'A';
}

// AdvancedMarker requires a Map ID. DEMO_MAP_ID is Google's public test ID.
// Override with a Cloud Console Map ID when you need custom cloud styling.
// Do NOT pass `styles` together with `mapId` — they are mutually exclusive and break the map.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

/** Must be a child of <Map> — useMap() is null outside the map instance. */
function ZoomForCoverage({
  stations,
  skipCenterFromCamera,
}: {
  stations: Station[];
  skipCenterFromCamera: MutableRefObject<boolean>;
}) {
  const map = useMap();
  const fittedKey = useRef('');

  useEffect(() => {
    if (!map || stations.length === 0) return;

    const maxDist = Math.max(...stations.map((s) => s.distanceKm ?? 0));
    if (maxDist <= 40) return;

    const key = stations
      .map((s) => s.id)
      .sort()
      .join(',');
    if (fittedKey.current === key) return;
    fittedKey.current = key;

    // ~100 km Pune cluster needs zoom 8; 40–80 km is zoom 9.
    skipCenterFromCamera.current = true;
    map.setZoom(maxDist > 80 ? 8 : 9);
    const t = window.setTimeout(() => {
      skipCenterFromCamera.current = false;
    }, 400);
    return () => window.clearTimeout(t);
  }, [map, stations, skipCenterFromCamera]);

  return null;
}

export function MapCanvas({ stations, apiKey, onSelectStation }: Props) {
  const { center, zoom, selectedStationId, selectStation, setCenter, setZoom } = useMapStore();
  const skipCenterFromCamera = useRef(false);

  function handlePinClick(stationId: string) {
    selectStation(stationId);
    onSelectStation(stationId);
  }

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center px-6 text-center"
        style={{ background: 'var(--color-surface-2)', color: 'var(--color-ink-2)' }}
      >
        <p style={{ fontSize: 14 }}>
          Google Maps API key missing. Set{' '}
          <code style={{ color: 'var(--color-brand-500)' }}>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{' '}
          in <code>.env.local</code> and restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['marker']}>
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        onCameraChanged={(ev) => {
          setZoom(ev.detail.zoom);
          if (skipCenterFromCamera.current) return;
          setCenter(ev.detail.center);
        }}
        gestureHandling="greedy"
        disableDefaultUI
        mapTypeId="roadmap"
        className="w-full h-full"
        mapId={MAP_ID}
      >
        <ZoomForCoverage stations={stations} skipCenterFromCamera={skipCenterFromCamera} />
        {stations.map((station) => (
          <AdvancedMarker
            key={station.id}
            position={station.coordinates}
            onClick={() => handlePinClick(station.id)}
            zIndex={selectedStationId === station.id ? 10 : 1}
          >
            <StationPin
              tier={(station.reliabilityTier ?? 'unknown') as ReliabilityTier}
              connectorLetter={primaryConnectorLetter(station)}
              isSelected={selectedStationId === station.id}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
