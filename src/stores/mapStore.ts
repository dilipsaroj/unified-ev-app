'use client';

import { create } from 'zustand';
import type { ConnectorType } from '@/lib/data/types';

interface MapFilters {
  availableOnly: boolean;
  connectorTypes: ConnectorType[];
  minReliability: number | undefined;
  maxPricePerKwh: number | undefined;
}

interface MapStore {
  center: { lat: number; lng: number };
  zoom: number;
  filters: MapFilters;
  selectedStationId: string | null;
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  setFilter: (patch: Partial<MapFilters>) => void;
  resetFilters: () => void;
  selectStation: (id: string | null) => void;
}

const DEFAULT_FILTERS: MapFilters = {
  availableOnly: false,
  connectorTypes: [],
  minReliability: undefined,
  maxPricePerKwh: undefined,
};

export const useMapStore = create<MapStore>((set) => ({
  center: { lat: 19.076, lng: 72.877 },
  zoom: 12,
  filters: DEFAULT_FILTERS,
  selectedStationId: null,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setFilter: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  selectStation: (selectedStationId) => set({ selectedStationId }),
}));
