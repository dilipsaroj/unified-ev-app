'use client';

import { User } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useUserStore } from '@/stores/userStore';

export default function ProfilePage() {
  const { currentUser, currentVehicle } = useUserStore();

  return (
    <div
      className="flex flex-1 flex-col px-6 pt-10 gap-8"
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

      {/* Placeholder notice */}
      <p
        className="text-center"
        style={{ fontSize: 13, color: 'var(--color-ink-4)', marginTop: 'auto' }}
      >
        Full profile, payment methods, and vehicle management coming in Week 2.
      </p>
    </div>
  );
}
