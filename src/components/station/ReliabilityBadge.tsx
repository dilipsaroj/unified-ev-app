import type { ReliabilityTier } from '@/lib/data/types';

interface Props {
  scorePct: number;
  tier: ReliabilityTier;
  size?: 'sm' | 'md';
}

const TIER_COLORS: Record<ReliabilityTier, string> = {
  green: 'var(--color-tier-green)',
  amber: 'var(--color-tier-amber)',
  red: 'var(--color-tier-red)',
  unknown: 'var(--color-tier-unknown)',
};

const SIZE = {
  sm: { diameter: 36, fontSize: 10 },
  md: { diameter: 44, fontSize: 13 },
} as const;

export function ReliabilityBadge({ scorePct, tier, size = 'sm' }: Props) {
  const { diameter, fontSize } = SIZE[size];
  const label = scorePct > 0 ? `${scorePct}%` : '?';

  return (
    <div
      className="inline-flex items-center justify-center rounded-full shrink-0 tabular-nums"
      style={{
        width: diameter,
        height: diameter,
        minWidth: diameter,
        minHeight: diameter,
        background: TIER_COLORS[tier],
        color: '#ffffff',
        fontSize: label.length > 3 ? fontSize - 1 : fontSize,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        boxSizing: 'border-box',
      }}
      aria-label={`${scorePct}% reliability — ${tier}`}
    >
      {label}
    </div>
  );
}
