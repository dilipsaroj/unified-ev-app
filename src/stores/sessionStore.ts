'use client';

import { create } from 'zustand';
import type { Session } from '@/lib/data/types';
import { dataClient } from '@/lib/data';

interface SessionStore {
  activeSession: Session | null;
  setActiveSession: (session: Session | null) => void;
  updateActiveSession: (update: Partial<Session>) => void;
  stopSession: (sessionId: string) => Promise<Session>;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  activeSession: null,

  setActiveSession: (activeSession) => set({ activeSession }),

  updateActiveSession: (update) => {
    const current = get().activeSession;
    if (current) {
      set({ activeSession: { ...current, ...update } });
    }
  },

  stopSession: async (sessionId: string) => {
    const stoppedSession = await dataClient.stopSession(sessionId);
    set({ activeSession: stoppedSession });
    return stoppedSession;
  },

  clearSession: () => set({ activeSession: null }),
}));
