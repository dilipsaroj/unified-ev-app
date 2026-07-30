'use client';

import { useMapStore } from '@/stores/mapStore';

interface ChipDef {
  label: string;
  key: 'availableOnly' | 'dcFast' | 'highReliability' | 'lowPrice';
}

const CHIPS: ChipDef[] = [
  { label: 'Available now', key: 'availableOnly' },
  { label: 'DC fast', key: 'dcFast' },
  { label: '≥ 90% reliable', key: 'highReliability' },
  { label: '< ₹15/kWh', key: 'lowPrice' },
];

export function FilterChips() {
  const { filters, setFilter } = useMapStore();

  // Derive active state for each chip from mapStore filters
  const active: Record<string, boolean> = {
    availableOnly: filters.availableOnly,
    dcFast: filters.connectorTypes.includes('CCS_2'),
    highReliability: filters.minReliability === 90,
    lowPrice: filters.maxPricePerKwh === 15,
  };

  function toggle(key: ChipDef['key']) {
    switch (key) {
      case 'availableOnly':
        setFilter({ availableOnly: !filters.availableOnly });
        break;
      case 'dcFast':
        setFilter({
          connectorTypes: filters.connectorTypes.includes('CCS_2')
            ? filters.connectorTypes.filter((t) => t !== 'CCS_2')
            : [...filters.connectorTypes, 'CCS_2'],
        });
        break;
      case 'highReliability':
        setFilter({ minReliability: filters.minReliability === 90 ? undefined : 90 });
        break;
      case 'lowPrice':
        setFilter({ maxPricePerKwh: filters.maxPricePerKwh === 15 ? undefined : 15 });
        break;
    }
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {CHIPS.map((chip) => (
        <button
          key={chip.key}
          onClick={() => toggle(chip.key)}
          className="flex-shrink-0 rounded-pill px-4 flex items-center"
          style={{
            height: 32,
            fontSize: 13,
            fontWeight: active[chip.key] ? 600 : 400,
            background: active[chip.key]
              ? 'var(--color-brand-500)'
              : 'var(--color-surface)',
            color: active[chip.key] ? '#ffffff' : 'var(--color-ink-2)',
            border: active[chip.key]
              ? 'none'
              : '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'background 150ms ease-out, color 150ms ease-out',
            whiteSpace: 'nowrap',
            borderRadius: 'var(--radius-pill)',
          }}
          aria-pressed={active[chip.key]}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
