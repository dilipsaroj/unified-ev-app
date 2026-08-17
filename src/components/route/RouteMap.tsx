'use client';

import { useEffect, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import type { PreGeneratedRoute, Station } from '@/lib/data/types';
import { Zap } from 'lucide-react';

interface Props {
  route: PreGeneratedRoute;
  chargingStop?: Station;
}

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const POLYLINE_STYLE: google.maps.PolylineOptions = {
  strokeColor: '#10B981',
  strokeOpacity: 1,
  strokeWeight: 4,
};

function fallbackPath(route: PreGeneratedRoute, chargingStop?: Station): google.maps.LatLngLiteral[] {
  return [
    route.originCoords,
    ...(chargingStop ? [chargingStop.coordinates] : []),
    route.destinationCoords,
  ];
}

function fitToPath(map: google.maps.Map, path: google.maps.LatLngLiteral[]) {
  const bounds = new google.maps.LatLngBounds();
  path.forEach((p) => bounds.extend(p));
  map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
}

function RoutePolyline({
  route,
  chargingStop,
}: {
  route: PreGeneratedRoute;
  chargingStop?: Station;
}) {
  const map = useMap();
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const fallbackRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !window.google?.maps) return;

    let cancelled = false;

    const clearOverlays = () => {
      rendererRef.current?.setMap(null);
      rendererRef.current = null;
      fallbackRef.current?.setMap(null);
      fallbackRef.current = null;
    };

    const drawFallback = () => {
      if (cancelled) return;
      clearOverlays();
      const path = fallbackPath(route, chargingStop);
      fallbackRef.current = new google.maps.Polyline({
        path,
        ...POLYLINE_STYLE,
        map,
      });
      fitToPath(map, path);
    };

    const service = new google.maps.DirectionsService();
    const request: google.maps.DirectionsRequest = {
      origin: route.originCoords,
      destination: route.destinationCoords,
      travelMode: google.maps.TravelMode.DRIVING,
    };
    if (chargingStop) {
      request.waypoints = [{ location: chargingStop.coordinates, stopover: true }];
    }

    service.route(request, (result, status) => {
      if (cancelled) return;
      if (status !== google.maps.DirectionsStatus.OK || !result) {
        drawFallback();
        return;
      }
      clearOverlays();
      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: false,
        polylineOptions: POLYLINE_STYLE,
      });
      renderer.setDirections(result);
      rendererRef.current = renderer;
    });

    return () => {
      cancelled = true;
      clearOverlays();
    };
  }, [map, route, chargingStop]);

  return null;
}

function MapContent({ route, chargingStop }: Props) {
  return (
    <>
      <RoutePolyline route={route} chargingStop={chargingStop} />

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
    <Map
      defaultCenter={route.originCoords}
      defaultZoom={8}
      gestureHandling="greedy"
      disableDefaultUI
      mapTypeId="roadmap"
      mapId={MAP_ID}
      style={{ width: '100%', height: '100%' }}
    >
      <MapContent route={route} chargingStop={chargingStop} />
    </Map>
  );
}
