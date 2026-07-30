'use client';

import { useEffect, useState } from 'react';
import {
  Map,
  APIProvider,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import type { PreGeneratedRoute, Station } from '@/lib/data/types';
import { Zap } from 'lucide-react';

interface Props {
  route: PreGeneratedRoute;
  chargingStop?: Station;
}

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

function RoutePolyline({ route }: { route: PreGeneratedRoute }) {
  const map = useMap();
  const geometryLibrary = useMapsLibrary('geometry');
  const [polyline, setPolyline] = useState<any>(null);

  useEffect(() => {
    if (!map || !geometryLibrary) return;

    // @ts-ignore - Google Maps API is loaded dynamically
    if (!window.google) return;

    // Decode the polyline
    // @ts-ignore
    const decodedPath = window.google.maps.geometry.encoding.decodePath(route.polylineEncoded);

    // Create the polyline
    // @ts-ignore
    const newPolyline = new window.google.maps.Polyline({
      path: decodedPath,
      strokeColor: '#10B981', // Brand mint
      strokeOpacity: 1,
      strokeWeight: 4,
      map,
    });

    setPolyline(newPolyline);

    // Fit bounds to show the entire route
    // @ts-ignore
    const bounds = new window.google.maps.LatLngBounds();
    decodedPath.forEach((point: any) => bounds.extend(point));
    map.fitBounds(bounds, { top: 20, bottom: 20, left: 20, right: 20 });

    return () => {
      newPolyline.setMap(null);
    };
  }, [map, geometryLibrary, route]);

  return null;
}

function MapContent({ route, chargingStop }: Props) {
  return (
    <>
      <RoutePolyline route={route} />

      {/* Origin marker */}
      <AdvancedMarker position={route.originCoords} zIndex={2}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--color-ink)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          A
        </div>
      </AdvancedMarker>

      {/* Destination marker */}
      <AdvancedMarker position={route.destinationCoords} zIndex={2}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--color-ink)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          B
        </div>
      </AdvancedMarker>

      {/* Charging stop marker (if available) */}
      {chargingStop && (
        <AdvancedMarker position={chargingStop.coordinates} zIndex={3}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--color-brand-500)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Zap size={20} fill="white" />
          </div>
        </AdvancedMarker>
      )}
    </>
  );
}

export function RouteMap({ route, chargingStop }: Props) {
  if (!API_KEY) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface-2)',
          color: 'var(--color-ink-2)',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 14 }}>Maps API key missing</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} libraries={['geometry', 'marker']}>
      <Map
        defaultCenter={route.originCoords}
        defaultZoom={8}
        gestureHandling="greedy"
        disableDefaultUI
        mapTypeId="roadmap"
        className="w-full h-full"
        mapId={MAP_ID}
      >
        <MapContent route={route} chargingStop={chargingStop} />
      </Map>
    </APIProvider>
  );
}
