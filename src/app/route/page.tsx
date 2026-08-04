'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Navigation as NavigationIcon, Zap, ChevronDown } from 'lucide-react';
import { dataClient } from '@/lib/data';
import type { PreGeneratedRoute, Station } from '@/lib/data/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { RouteMap } from '@/components/route/RouteMap';
import { useToast } from '@/hooks/useToast';

export default function RoutePage() {
  const router = useRouter();
  const { error } = useToast();
  const [routes, setRoutes] = useState<PreGeneratedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<PreGeneratedRoute | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plannedRoute, setPlannedRoute] = useState<PreGeneratedRoute | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [routesData, stationsData] = await Promise.all([
          dataClient.getPreGeneratedRoutes(),
          dataClient.getStationsNear(19.076, 72.877, 500), // Get all stations
        ]);
        setRoutes(routesData);
        setStations(stationsData);
        if (routesData.length > 0) {
          setSelectedRoute(routesData[0]);
        }
      } catch (err) {
        console.error('Failed to load routes:', err);
        error('Failed to load routes. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [error]);

  const handlePlanTrip = () => {
    if (!selectedRoute) return;
    setPlannedRoute(selectedRoute);
  };

  const handleStartNavigation = () => {
    if (!plannedRoute) return;
    const { originCoords, destinationCoords } = plannedRoute;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originCoords.lat},${originCoords.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const chargingStop = stations.find((s) => s.id === plannedRoute?.chargingStopStationId);
  const alternativeStops = stations.filter((s) =>
    (plannedRoute?.alternativeStationIds ?? []).includes(s.id),
  );

  if (loading) {
    return (
      <div className="flex flex-1 flex-col" style={{ background: 'var(--color-bg)' }}>
        {/* Header skeleton */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <Skeleton width={24} height={24} circle />
          <Skeleton width={120} height={20} />
          <Skeleton width={24} height={24} circle />
        </div>
        {/* Content skeleton */}
        <div className="flex-1 p-4 space-y-4">
          <Skeleton height={48} rounded />
          <Skeleton height={48} rounded />
          <Skeleton height={200} rounded />
        </div>
      </div>
    );
  }

  const showMap = plannedRoute !== null || selectedRoute !== null;

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
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
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink)' }}>
          Plan a trip
        </h1>
        <button style={{ color: 'var(--color-ink-3)' }} aria-label="Settings">
          <Settings size={24} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
        {/* Route selection */}
        <div className="p-4 space-y-3">
          {/* Origin */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-ink-2)',
                marginBottom: 8,
              }}
            >
              Origin
            </label>
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 14,
                color: 'var(--color-ink)',
              }}
            >
              Current location — {selectedRoute?.originName || 'Loading...'}
            </div>
          </div>

          {/* Destination */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-ink-2)',
                marginBottom: 8,
              }}
            >
              Destination
            </label>
            <div className="relative">
              <select
                value={selectedRoute?.id || ''}
                onChange={(e) => {
                  const route = routes.find((r) => r.id === e.target.value);
                  setSelectedRoute(route || null);
                  setPlannedRoute(null);
                  setShowAlternatives(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 16px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 14,
                  color: 'var(--color-ink)',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.destinationName}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={20}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-ink-3)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Vehicle summary */}
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

          {/* Plan trip button */}
          {plannedRoute === null && (
            <button
              onClick={handlePlanTrip}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'var(--color-brand-500)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <NavigationIcon size={20} />
              Plan trip
            </button>
          )}
        </div>

        {/* Map and route details */}
        {showMap && (
          <>
            {/* Map */}
            <div style={{ height: 300, position: 'relative' }}>
              <RouteMap
                route={plannedRoute ?? selectedRoute!}
                chargingStop={plannedRoute ? chargingStop : undefined}
              />
            </div>

            {/* Route summary */}
            {plannedRoute !== null && (
              <div className="p-4 space-y-3">
                {/* Summary card */}
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
                      <p
                        style={{ fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 4 }}
                      >
                        Distance
                      </p>
                      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
                        {plannedRoute.distanceKm} km
                      </p>
                    </div>
                    <div>
                      <p
                        style={{ fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 4 }}
                      >
                        Duration
                      </p>
                      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
                        {Math.floor(plannedRoute.durationMins / 60)}h{' '}
                        {plannedRoute.durationMins % 60}m
                      </p>
                    </div>
                    <div>
                      <p
                        style={{ fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 4 }}
                      >
                        Arrival SoC
                      </p>
                      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
                        15%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Charging stop card */}
                {chargingStop && (
                  <div
                    style={{
                      padding: 16,
                      background: 'var(--color-surface)',
                      border: `2px solid var(--color-brand-500)`,
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
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--color-brand-500)',
                        }}
                      >
                        Charging stop · ETA 11:47 am
                      </p>
                    </div>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--color-ink)',
                        marginBottom: 8,
                      }}
                    >
                      {chargingStop.name}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
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
                    <div
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}
                    >
                      <div>
                        <p
                          style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 2 }}
                        >
                          Arrive SoC
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                          25%
                        </p>
                      </div>
                      <div>
                        <p
                          style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 2 }}
                        >
                          Charge to
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                          80%
                        </p>
                      </div>
                      <div>
                        <p
                          style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 2 }}
                        >
                          Duration
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                          45 min
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
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

                {/* Alternative stops */}
                {showAlternatives && alternativeStops.length > 0 && (
                  <div className="space-y-3">
                    {alternativeStops.map((stop) => (
                      <div
                        key={stop.id}
                        style={{
                          padding: 16,
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 12,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--color-ink)',
                            marginBottom: 8,
                          }}
                        >
                          {stop.name}
                        </h3>
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
