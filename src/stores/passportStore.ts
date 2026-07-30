'use client';

import { create } from 'zustand';
import type { Session } from '@/lib/data/types';

interface PassportStore {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
}

export const usePassportStore = create<PassportStore>((set) => ({
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
}));
