'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data';
import type { Station } from '@/lib/data/types';

interface UseStationResult {
  station: Station | null;
  loading: boolean;
  error: string | null;
}

export function useStation(id: string): UseStationResult {
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    dataClient
      .getStation(id)
      .then((s) => {
        if (cancelled) return;
        setStation(s);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load station');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { station, loading, error };
}
