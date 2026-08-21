'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { MapCanvas } from '@/components/map/MapCanvas';
import { SearchBar } from '@/components/map/SearchBar';
import { FilterChips } from '@/components/map/FilterChips';
import { BottomSheet } from '@/components/map/BottomSheet';
import { useMapStore } from '@/stores/mapStore';
import { useStations } from '@/hooks/useStations';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/useToast';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const SEARCH_RADIUS_KM = 50;

export default function MapPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { success } = useToast();
  const { center, filters, selectedStationId, selectStation, setCenter } = useMapStore();
  const { stations, loading } = useStations(center.lat, center.lng, SEARCH_RADIUS_KM, {
    availableOnly: filters.availableOnly,
    connectorTypes: filters.connectorTypes.length > 0 ? filters.connectorTypes : undefined,
    minReliability: filters.minReliability,
    maxPricePerKwh: filters.maxPricePerKwh,
  });

  // Avoid SSR/client hydration mismatch — decide after mount
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('uev_map_hint_dismissed')) {
      setShowHint(true);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (sessionStorage.getItem('uev_welcomed')) return;

    const timer = setTimeout(() => {
      success(
        `Welcome to Unified-EV, ${currentUser.name || 'there'} 👋 Tap any station to start`,
      );
      sessionStorage.setItem('uev_welcomed', 'true');
    }, 800);

    return () => clearTimeout(timer);
    // success identity changes each render; sessionStorage flag ensures once-per-session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => {
      setShowHint(false);
      sessionStorage.setItem('uev_map_hint_dismissed', 'true');
    }, 5000);
    return () => clearTimeout(timer);
  }, [showHint]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        // Permission denied or GPS unavailable — keep Mumbai default silently
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismissHint() {
    setShowHint(false);
    sessionStorage.setItem('uev_map_hint_dismissed', 'true');
  }

  function handleSelectStation(id: string) {
    selectStation(id);
  }

  function handleCardClick(id: string) {
    router.push(`/station/${id}`);
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        <MapCanvas
          stations={stations}
          apiKey={MAPS_API_KEY}
          onSelectStation={handleSelectStation}
        />
      </div>

      <div className="absolute left-4 right-4 z-30 flex flex-col gap-2" style={{ top: 16 }}>
        <SearchBar />
        <FilterChips />
        {showHint && (
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{
              background: 'var(--color-brand-50)',
              border: '1px solid var(--color-brand-500)',
              marginBottom: 8,
            }}
          >
            <p className="text-sm" style={{ color: 'var(--color-brand-900)', flex: 1 }}>
              Tap any station to see its reliability score before driving there
            </p>
            <button
              type="button"
              onClick={dismissHint}
              style={{ color: 'var(--color-brand-500)', marginLeft: 12, flexShrink: 0 }}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <BottomSheet
        stations={stations}
        loading={loading}
        selectedStationId={selectedStationId}
        onSelectStation={handleCardClick}
      />
    </div>
  );
}
