import type { ReliabilityScore, ReliabilityTier } from './data/types';

export function scoreTier(scorePct: number): ReliabilityTier {
  if (scorePct >= 90) return 'green';
  if (scorePct >= 70) return 'amber';
  return 'red';
}

export function tierColor(tier: ReliabilityTier): string {
  switch (tier) {
    case 'green':
      return 'var(--color-tier-green)';
    case 'amber':
      return 'var(--color-tier-amber)';
    case 'red':
      return 'var(--color-tier-red)';
    case 'unknown':
      return 'var(--color-tier-unknown)';
  }
}

/** Formats "12 min ago", "2 hr ago", etc. */
export function lastConfirmedLabel(isoTimestamp: string): string {
  if (!isoTimestamp) return 'Unknown';
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ago`;
}

/** Weighted average reliability score across a set of connector scores */
export function aggregateReliability(scores: ReliabilityScore[]): number {
  if (scores.length === 0) return 0;
  const totalSamples = scores.reduce((acc, r) => acc + r.sampleSize, 0);
  if (totalSamples === 0) return 0;
  return Math.round(
    scores.reduce((acc, r) => acc + r.scorePct * (r.sampleSize / totalSamples), 0),
  );
}
