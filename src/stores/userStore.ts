'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Vehicle } from '@/lib/data/types';

const DEMO_USER: User = {
  id: 'demo-user',
  phone: '+91 98765 43210',
  name: 'Rohan Mehta',
  vehicleId: 'tata-nexon-ev',
  createdAt: '2026-06-01T00:00:00Z',
};

const DEMO_VEHICLE: Vehicle = {
  id: 'tata-nexon-ev-max',
  make: 'Tata',
  model: 'Nexon EV Max',
  batteryKwh: 40.5,
  connectorType: 'CCS_2',
  avgConsumptionWhPerKm: 150,
  maxChargeRateKw: 50,
  preferredChargeToPct: 80,
};

interface UserStore {
  currentUser: User | null;
  currentVehicle: Vehicle | null;
  isAuthenticated: boolean;
  login: (user: User, vehicle?: Vehicle) => void;
  logout: () => void;
  setVehicle: (vehicle: Vehicle) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      currentVehicle: null,
      isAuthenticated: false,

      login(user, vehicle) {
        set({ currentUser: user, currentVehicle: vehicle ?? null, isAuthenticated: true });
      },

      logout() {
        set({ currentUser: null, currentVehicle: null, isAuthenticated: false });
      },

      setVehicle(vehicle) {
        set({ currentVehicle: vehicle });
      },
    }),
    {
      name: 'unified-ev-user',
    },
  ),
);
