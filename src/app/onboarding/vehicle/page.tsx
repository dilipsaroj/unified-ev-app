'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Bike, Truck, Car } from 'lucide-react';
import Link from 'next/link';
import { dataClient } from '@/lib/data';
import { useUserStore } from '@/stores/userStore';
import type { Vehicle, VehicleClass } from '@/lib/data/types';

const SEGMENTS: {
  class: VehicleClass;
  label: string;
  icon: typeof Bike;
}[] = [
  { class: 'TWO_WHEELER', label: 'Two-wheeler', icon: Bike },
  { class: 'THREE_WHEELER', label: 'Three-wheeler', icon: Truck },
  { class: 'FOUR_WHEELER', label: 'Four-wheeler', icon: Car },
];

export default function OnboardingVehiclePage() {
  const router = useRouter();
  const { currentUser, setVehicle, setVehicleClass, vehicleClass } = useUserStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedClass, setSelectedClass] = useState<VehicleClass | null>(vehicleClass);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [preferredChargePct, setPreferredChargePct] = useState(80);
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/onboarding');
      return;
    }

    const loadVehicles = async () => {
      const data = await dataClient.getVehicles();
      setVehicles(data);
    };
    loadVehicles();
  }, [currentUser, router]);

  const classCounts = useMemo(() => {
    const counts: Record<VehicleClass, number> = {
      TWO_WHEELER: 0,
      THREE_WHEELER: 0,
      FOUR_WHEELER: 0,
      COMMERCIAL: 0,
    };
    for (const v of vehicles) {
      counts[v.vehicleClass] += 1;
    }
    return counts;
  }, [vehicles]);

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedClass && v.vehicleClass !== selectedClass) return false;
    const searchLower = search.toLowerCase();
    const fullName = `${v.make} ${v.model} ${v.variant || ''}`.toLowerCase();
    return fullName.includes(searchLower);
  });

  const handleSelectClass = (cls: VehicleClass) => {
    setSelectedClass(cls);
    setVehicleClass(cls);
    setSelectedVehicle(null);
    setSearch('');
    setIsDropdownOpen(false);
  };

  const handleContinue = () => {
    if (!selectedVehicle) return;

    setIsLoading(true);
    setVehicle(selectedVehicle);
    router.push('/map');
  };

  const rangeKm = selectedVehicle
    ? Math.round((selectedVehicle.batteryKwh * 1000) / selectedVehicle.avgConsumptionWhPerKm)
    : 0;

  return (
    <div
      className="flex flex-1 flex-col"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-ink)',
      }}
    >
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link
          href="/onboarding/otp"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--color-ink-2)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={20} />
        </Link>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginLeft: 'var(--space-4)',
          }}
        >
          What do you drive?
        </h1>
      </div>

      <div
        className="flex flex-1 flex-col justify-between"
        style={{ padding: 'var(--space-6)' }}
      >
        <div className="flex flex-col gap-6">
          {/* Vehicle segment picker — Tailwind only */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-neutral-ink-2">Vehicle type</p>
            <div className="grid grid-cols-3 gap-3">
              {SEGMENTS.map(({ class: cls, label, icon: Icon }) => {
                const isActive = selectedClass === cls;
                const count = classCounts[cls];
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleSelectClass(cls)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                      isActive
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-neutral-border bg-neutral-surface text-neutral-ink-2'
                    }`}
                  >
                    <Icon size={28} className={isActive ? 'text-brand-500' : 'text-neutral-ink-3'} />
                    <span className="text-xs font-semibold text-center leading-tight">{label}</span>
                    <span className="text-xs text-neutral-ink-3">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedClass && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="vehicle"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--color-ink-2)',
              }}
            >
              Vehicle model
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="vehicle"
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search for your vehicle..."
                autoFocus
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  fontSize: 15,
                  color: 'var(--color-ink)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
              <ChevronDown
                size={20}
                color="var(--color-ink-3)"
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />

              {isDropdownOpen && filteredVehicles.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    maxHeight: 280,
                    overflowY: 'auto',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 10,
                  }}
                >
                  {filteredVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setSearch(`${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        textAlign: 'left',
                        fontSize: 14,
                        color: 'var(--color-ink)',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-surface-2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>
                        {vehicle.make} {vehicle.model}
                      </div>
                      {vehicle.variant && (
                        <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>
                          {vehicle.variant}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {selectedVehicle && (
            <>
              <div
                style={{
                  padding: 'var(--space-5)',
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
                    {selectedVehicle.make} {selectedVehicle.model}
                  </div>
                  {selectedVehicle.variant && (
                    <div style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 2 }}>
                      {selectedVehicle.variant}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                      Battery
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                      {selectedVehicle.batteryKwh} kWh
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                      Range
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                      ~{rangeKm} km
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                      Connector
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                      {selectedVehicle.connectorType.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                      Max charge
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                      {selectedVehicle.maxChargeRateKw} kW
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label
                  htmlFor="charge-pct"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--color-ink-2)',
                  }}
                >
                  Preferred charge-to percentage
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="charge-pct"
                    type="range"
                    min="60"
                    max="100"
                    step="5"
                    value={preferredChargePct}
                    onChange={(e) => setPreferredChargePct(Number(e.target.value))}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: `linear-gradient(to right, var(--color-brand-500) 0%, var(--color-brand-500) ${preferredChargePct}%, var(--color-surface-3) ${preferredChargePct}%, var(--color-surface-3) 100%)`,
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--color-brand-500)',
                      minWidth: 44,
                      textAlign: 'right',
                    }}
                  >
                    {preferredChargePct}%
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--color-ink-3)',
                    lineHeight: 1.5,
                  }}
                >
                  Most EVs charge slower above 80%. We&apos;ll use this to estimate session times.
                </p>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedVehicle || isLoading}
          style={{
            width: '100%',
            height: 52,
            background: selectedVehicle && !isLoading ? 'var(--color-brand-500)' : 'var(--color-surface-3)',
            color: selectedVehicle && !isLoading ? 'white' : 'var(--color-ink-4)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: selectedVehicle && !isLoading ? 'pointer' : 'not-allowed',
            transition: 'transform 100ms ease-out',
          }}
          onMouseDown={(e) => {
            if (selectedVehicle && !isLoading) {
              e.currentTarget.style.transform = 'scale(0.98)';
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
