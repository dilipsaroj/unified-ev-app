'use client';

import { useRouter } from 'next/navigation';
import { MapCanvas } from '@/components/map/MapCanvas';
import { SearchBar } from '@/components/map/SearchBar';
import { FilterChips } from '@/components/map/FilterChips';
import { BottomSheet } from '@/components/map/BottomSheet';
import { useMapStore } from '@/stores/mapStore';
import { useStations } from '@/hooks/useStations';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const SEARCH_RADIUS_KM = 25;

export default function MapPage() {
  const router = useRouter();
  const { center, filters, selectedStationId, selectStation } = useMapStore();
  const { stations, loading } = useStations(center.lat, center.lng, SEARCH_RADIUS_KM, {
    availableOnly: filters.availableOnly,
    connectorTypes: filters.connectorTypes.length > 0 ? filters.connectorTypes : undefined,
    minReliability: filters.minReliability,
    maxPricePerKwh: filters.maxPricePerKwh,
  });

  function handleSelectStation(id: string) {
    selectStation(id);
  }

  function handleCardClick(id: string) {
    router.push(`/station/${id}`);
  }

  return (
    <div className="relative w-full h-full" style={{ paddingBottom: 64 }}>
      <div className="absolute inset-0" style={{ bottom: 0 }}>
        <MapCanvas
          stations={stations}
          apiKey={MAPS_API_KEY}
          onSelectStation={handleSelectStation}
        />
      </div>

      <div
        className="absolute left-4 right-4 z-30 flex flex-col gap-2"
        style={{ top: 16 }}
      >
        <SearchBar />
        <FilterChips />
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
