'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

/**
 * Runs once on mount to sync the theme store with localStorage / prefers-color-scheme
 * before the first render. Rendered inside the root layout.
 */
export function ThemeInitializer() {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return null;
}
