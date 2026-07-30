'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-2 rounded-lg px-4 py-2"
      style={{
        background: 'var(--color-surface-2)',
        color: 'var(--color-ink-2)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        transition: 'background 150ms ease-out',
        minHeight: 44,
        minWidth: 44,
      }}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
