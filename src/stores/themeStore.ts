'use client';

import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme(theme) {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    applyTheme(resolved);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    set({ theme, resolvedTheme: resolved });
  },

  toggleTheme() {
    const next = get().resolvedTheme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },

  initTheme() {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem('theme') as ThemeMode | null;
    const theme: ThemeMode = stored ?? 'system';
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },
}));
