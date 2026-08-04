'use client';

import Link from 'next/link';
import { ChevronRight, User } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useUserStore } from '@/stores/userStore';

export default function ProfilePage() {
  const { currentUser, currentVehicle } = useUserStore();

  return (
    <div
      className="flex h-full flex-col overflow-y-auto px-6 pt-10 gap-8"
      style={{ paddingBottom: 96, color: 'var(--color-ink)' }}
    >
      {/* User info */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 56,
            height: 56,
            background: 'var(--color-brand-50)',
            color: 'var(--color-brand-500)',
          }}
        >
          <User size={28} />
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>{currentUser?.name ?? 'Demo User'}</p>
          <p style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>
            {currentUser?.phone ?? '+91 —'}
          </p>
        </div>
      </div>

      {/* Vehicle */}
      {currentVehicle && (
        <div
          className="rounded-lg p-5"
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p style={{ fontSize: 11, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Vehicle
          </p>
          <p style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
            {currentVehicle.make} {currentVehicle.model}
          </p>
          {currentVehicle.variant && (
            <p style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 2 }}>
              {currentVehicle.variant}
            </p>
          )}
          <p style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 2 }}>
            {currentVehicle.batteryKwh} kWh · {Math.round((currentVehicle.batteryKwh * 1000) / currentVehicle.avgConsumptionWhPerKm)} km range
          </p>
        </div>
      )}

      {/* Theme toggle */}
      <div>
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Appearance
        </p>
        <ThemeToggle />
      </div>

      {/* Help & Support — WhatsApp */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-ink-3">
          Help & Support
        </p>
        {/* TODO: Replace with real WhatsApp Business number when registered */}
        <a
          href="https://wa.me/91XXXXXXXXXX?text=Hi%20Unified-EV%20team%2C%20I%20need%20help%20with%20..."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg border border-neutral-border bg-neutral-surface-2 p-4 transition-opacity active:opacity-80"
        >
          <span className="text-h3 leading-none" aria-hidden>
            💬
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-body font-semibold text-neutral-ink">Get help on WhatsApp</span>
            <span className="text-sm text-neutral-ink-3">Typical reply in 2 hours (9am–9pm)</span>
          </span>
        </a>

        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-ink-3">
          Legal
        </p>
        <div className="overflow-hidden rounded-lg border border-neutral-border bg-neutral-surface-2">
          <Link
            href="/policies/refund"
            className="flex items-center justify-between px-4 py-3.5 transition-opacity active:opacity-80"
          >
            <span className="text-body text-neutral-ink">Refund Policy</span>
            <ChevronRight size={18} className="text-neutral-ink-3" />
          </Link>
          <div className="border-t border-neutral-border" />
          <a
            href="#"
            className="flex items-center justify-between px-4 py-3.5 text-neutral-ink-3"
            onClick={(e) => e.preventDefault()}
            aria-disabled
          >
            <span className="text-body">Privacy Policy</span>
            <ChevronRight size={18} />
          </a>
          <div className="border-t border-neutral-border" />
          <a
            href="#"
            className="flex items-center justify-between px-4 py-3.5 text-neutral-ink-3"
            onClick={(e) => e.preventDefault()}
            aria-disabled
          >
            <span className="text-body">Terms of Service</span>
            <ChevronRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
