import type { ReliabilityTier } from '@/lib/data/types';

interface Props {
  tier: ReliabilityTier;
  connectorLetter: 'D' | 'A';
  isSelected?: boolean;
}

const TIER_COLORS: Record<ReliabilityTier, string> = {
  green: 'var(--color-tier-green)',
  amber: 'var(--color-tier-amber)',
  red: 'var(--color-tier-red)',
  unknown: 'var(--color-tier-unknown)',
};

const SIZE_BY_TIER: Record<ReliabilityTier, number> = {
  green: 32,
  amber: 32,
  red: 28,
  unknown: 28,
};

export function StationPin({ tier, connectorLetter, isSelected }: Props) {
  const size = isSelected ? SIZE_BY_TIER[tier] * 1.25 : SIZE_BY_TIER[tier];

  return (
    <div
      className="flex items-center justify-center rounded-full cursor-pointer select-none"
      style={{
        width: size,
        height: size,
        background: TIER_COLORS[tier],
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 700,
        transform: isSelected ? 'scale(1.25)' : 'scale(1)',
        transition: 'transform 200ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 200ms ease-out',
        willChange: 'transform',
      }}
      aria-label={`${tier} reliability, ${connectorLetter === 'D' ? 'DC' : 'AC'} connector`}
    >
      {connectorLetter}
    </div>
  );
}
