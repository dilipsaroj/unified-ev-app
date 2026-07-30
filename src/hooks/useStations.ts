'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data';
import { rankStations } from '@/lib/recommend';
import type { Station, StationFilters } from '@/lib/data/types';

interface UseStationsResult {
  stations: Station[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStations(
  lat: number,
  lng: number,
  radiusKm: number,
  filters?: StationFilters,
): UseStationsResult {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    dataClient
      .getStationsNear(lat, lng, radiusKm, filters)
      .then((raw) => {
        if (cancelled) return;
        setStations(rankStations(raw));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load stations');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, radiusKm, tick, JSON.stringify(filters)]);

  return {
    stations,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}
