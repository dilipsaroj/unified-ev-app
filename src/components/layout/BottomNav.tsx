'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Navigation, ScanLine, BookOpen, User, type LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isCentral?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/route', icon: Navigation, label: 'Route' },
  { href: '/scan', icon: ScanLine, label: 'Scan', isCentral: true },
  { href: '/passport', icon: BookOpen, label: 'Passport' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around"
      style={{
        height: 64,
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label, isCentral }) => {
        const isActive = pathname === href || (href === '/map' && pathname === '/');

        if (isCentral) {
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex flex-col items-center justify-center"
              style={{ marginBottom: 12, position: 'relative', bottom: 0 }}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 56,
                  height: 56,
                  background: 'var(--color-brand-500)',
                  boxShadow: 'var(--shadow-lg)',
                  marginBottom: -2,
                }}
              >
                <Icon size={24} color="white" strokeWidth={2} />
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-end gap-1 pb-2"
            style={{
              minWidth: 56,
              height: '100%',
              color: isActive ? 'var(--color-brand-500)' : 'var(--color-ink-3)',
              transition: 'color 150ms ease-out',
            }}
            aria-label={label}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                lineHeight: '14px',
                letterSpacing: '0.01em',
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
