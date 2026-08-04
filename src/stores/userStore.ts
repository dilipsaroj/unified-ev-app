'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Vehicle, VehicleClass } from '@/lib/data/types';

interface UserStore {
  currentUser: User | null;
  currentVehicle: Vehicle | null;
  vehicleClass: VehicleClass | null;
  isAuthenticated: boolean;
  login: (user: User, vehicle?: Vehicle) => void;
  logout: () => void;
  setVehicle: (vehicle: Vehicle) => void;
  setVehicleClass: (vehicleClass: VehicleClass) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      currentVehicle: null,
      vehicleClass: null,
      isAuthenticated: false,

      login(user, vehicle) {
        set({
          currentUser: user,
          currentVehicle: vehicle ?? null,
          vehicleClass: vehicle?.vehicleClass ?? null,
          isAuthenticated: true,
        });
      },

      logout() {
        set({
          currentUser: null,
          currentVehicle: null,
          vehicleClass: null,
          isAuthenticated: false,
        });
      },

      setVehicle(vehicle) {
        set({ currentVehicle: vehicle, vehicleClass: vehicle.vehicleClass });
      },

      setVehicleClass(vehicleClass) {
        set({ vehicleClass });
      },
    }),
    {
      name: 'unified-ev-user',
    },
  ),
);
