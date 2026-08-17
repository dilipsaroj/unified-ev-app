'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Navigation as NavigationIcon, Zap, ChevronRight } from 'lucide-react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { dataClient } from '@/lib/data';
import type { PreGeneratedRoute, Station } from '@/lib/data/types';
import { RouteMap } from '@/components/route/RouteMap';
import { PlaceSearchField, type PlaceSearchHandle, type PlaceValue } from '@/components/route/PlaceSearchField';
import { useToast } from '@/hooks/useToast';
import { alongSegment, haversineKm } from '@/lib/geo';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

function pickStopsAlongTrip(stations: Station[], origin: PlaceValue, dest: PlaceValue): Station[] {
  const originLL = { lat: origin.lat, lng: origin.lng };
  const destLL = { lat: dest.lat, lng: dest.lng };
  const scored = stations.map((s) => {
    const { t, offsetKm } = alongSegment(s.coordinates, originLL, destLL);
    return { s, t, offsetKm };
  });
  const along = scored
    .filter((x) => x.t > 0.12 && x.t < 0.88 && x.offsetKm < 45)
    .sort((a, b) => Math.abs(a.t - 0.5) - Math.abs(b.t - 0.5) || a.offsetKm - b.offsetKm)
    .map((x) => x.s);
  if (along.length >= 3) return along.slice(0, 3);
  const rest = scored
    .filter((x) => !along.includes(x.s))
    .sort((a, b) => a.offsetKm - b.offsetKm)
    .map((x) => x.s);
  return [...along, ...rest].slice(0, 3);
}

export default function RoutePage() {
  const router = useRouter();
  const { error } = useToast();
  const originRef = useRef<PlaceSearchHandle>(null);
  const destRef = useRef<PlaceSearchHandle>(null);
  const [origin, setOrigin] = useState<PlaceValue | null>(null);
  const [destination, setDestination] = useState<PlaceValue | null>(null);
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [plannedRoute, setPlannedRoute] = useState<PreGeneratedRoute | null>(null);

  const chargingStop = stations.find((s) => s.id === plannedRoute?.chargingStopStationId);
  const alternativeStops = stations.filter((s) =>
    (plannedRoute?.alternativeStationIds ?? []).includes(s.id),
  );

  async function handlePlanTrip() {
    const resolvedOrigin = (await originRef.current?.resolve()) ?? origin;
    const resolvedDest = (await destRef.current?.resolve()) ?? destination;
    if (!resolvedOrigin || !resolvedDest) {
      error('Enter an origin and destination, then pick a suggestion or tap Plan trip again.');
      return;
    }
    setOrigin(resolvedOrigin);
    setDestination(resolvedDest);
    setPlanning(true);
    setShowAlternatives(false);
    try {
      const roadKm = haversineKm(resolvedOrigin, resolvedDest) * 1.25;
      const mid = {
        lat: (resolvedOrigin.lat + resolvedDest.lat) / 2,
        lng: (resolvedOrigin.lng + resolvedDest.lng) / 2,
      };
      const nearby = await dataClient.getStationsNear(mid.lat, mid.lng, Math.max(roadKm, 80));
      const stops = pickStopsAlongTrip(nearby, resolvedOrigin, resolvedDest);
      const [recommended, ...alts] = stops;
      setStations(stops);
      setPlannedRoute({
        id: `trip-${resolvedOrigin.lat}-${resolvedDest.lat}`,
        originName: resolvedOrigin.name,
        originCoords: { lat: resolvedOrigin.lat, lng: resolvedOrigin.lng },
        destinationName: resolvedDest.name,
        destinationCoords: { lat: resolvedDest.lat, lng: resolvedDest.lng },
        distanceKm: Math.round(roadKm),
        durationMins: Math.max(15, Math.round((roadKm / 55) * 60)),
        polylineEncoded: '',
        chargingStopStationId: recommended?.id ?? '',
        alternativeStationIds: alts.map((s) => s.id),
      });
    } catch (err) {
      console.error(err);
      error('Could not plan this trip. Try another origin or destination.');
    } finally {
      setPlanning(false);
    }
  }

  function handleStartNavigation() {
    if (!plannedRoute) return;
    const { originCoords, destinationCoords } = plannedRoute;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originCoords.lat},${originCoords.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}&travelmode=driving`;
    window.open(url, '_blank');
  }

  const canPlan =
    originQuery.trim().length >= 2 && destQuery.trim().length >= 2 && !planning;

  const form = (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--color-bg)' }}>
      <div
        className="flex flex-shrink-0 items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => router.back()}
          style={{ color: 'var(--color-ink)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink)' }}>Plan a trip</h1>
        <button style={{ color: 'var(--color-ink-3)' }} aria-label="Settings">
          <Settings size={24} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
        <div className="p-4 space-y-3">
          <PlaceSearchField
            ref={originRef}
            label="Origin"
            placeholder="Search starting point"
            value={origin}
            onChange={(place) => {
              setOrigin(place);
              setPlannedRoute(null);
            }}
            onQueryChange={setOriginQuery}
            allowCurrentLocation
          />
          <PlaceSearchField
            ref={destRef}
            label="Destination"
            placeholder="Search destination"
            value={destination}
            onChange={(place) => {
              setDestination(place);
              setPlannedRoute(null);
            }}
            onQueryChange={setDestQuery}
          />

          <div
            style={{
              padding: 12,
              background: 'var(--color-surface-2)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--color-brand-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-brand-500)',
              }}
            >
              <Zap size={20} fill="currentColor" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>
                Current vehicle
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>40% SoC</p>
            </div>
          </div>

          {plannedRoute === null && (
            <button
              onClick={handlePlanTrip}
              disabled={!canPlan}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: canPlan ? 'var(--color-brand-500)' : 'var(--color-surface-3)',
                color: canPlan ? 'white' : 'var(--color-ink-3)',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: canPlan ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <NavigationIcon size={20} />
              {planning ? 'Planning…' : 'Plan trip'}
            </button>
          )}
        </div>

        {plannedRoute && (
          <>
            <div style={{ height: 300, position: 'relative' }}>
              <RouteMap route={plannedRoute} chargingStop={chargingStop} />
            </div>

            <div className="p-4 space-y-3">
              <div
                style={{
                  padding: 16,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                      Distance
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
                      {plannedRoute.distanceKm} km
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                      Duration
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
                      {Math.floor(plannedRoute.durationMins / 60)}h {plannedRoute.durationMins % 60}m
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                      Arrival SoC
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>15%</p>
                  </div>
                </div>
              </div>

              {chargingStop && (
                <div
                  style={{
                    padding: 16,
                    background: 'var(--color-surface)',
                    border: '2px solid var(--color-brand-500)',
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Zap size={16} style={{ color: 'var(--color-brand-500)' }} />
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-brand-500)' }}>
                      Charging stop
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/station/${chargingStop.id}`)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
                      {chargingStop.name}
                    </h3>
                    <ChevronRight size={18} style={{ color: 'var(--color-ink-3)', flexShrink: 0 }} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: chargingStop.cpo?.chipColor || 'var(--color-ink-3)',
                      }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--color-ink-2)' }}>
                      {chargingStop.cpo?.name || 'Unknown CPO'}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleStartNavigation}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: 'var(--color-brand-500)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Start navigation
                </button>
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: 'var(--color-surface)',
                    color: 'var(--color-ink)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  See {alternativeStops.length} alternatives
                </button>
              </div>

              {showAlternatives && alternativeStops.length > 0 && (
                <div className="space-y-3">
                  {alternativeStops.map((stop) => (
                    <button
                      key={stop.id}
                      type="button"
                      onClick={() => router.push(`/station/${stop.id}`)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: 16,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                          {stop.name}
                        </h3>
                        <ChevronRight size={18} style={{ color: 'var(--color-ink-3)', flexShrink: 0 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: stop.cpo?.chipColor || 'var(--color-ink-3)',
                          }}
                        />
                        <span style={{ fontSize: 13, color: 'var(--color-ink-2)' }}>
                          {stop.cpo?.name || 'Unknown CPO'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (!API_KEY) {
    return form;
  }

  return (
    <APIProvider apiKey={API_KEY} libraries={['places', 'marker']}>
      {form}
    </APIProvider>
  );
}
