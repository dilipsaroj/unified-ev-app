import type { Station } from './data/types';

interface ScoredStation extends Station {
  _score: number;
}

/**
 * Ranks stations by a weighted composite score.
 *
 * Weights reflect the product's reliability-as-moat thesis:
 *   reliability  40% — our core differentiator
 *   availability 30% — useless if the connector is occupied/faulted
 *   distance     20% — closer is better but not at the cost of reliability
 *   price        10% — ₹/kWh matters but is secondary to uptime
 */
export function rankStations(stations: Station[]): Station[] {
  const maxDistance = Math.max(...stations.map((s) => s.distanceKm ?? 0), 1);
  const allPrices = stations.flatMap(
    (s) => s.connectors?.map((c) => c.pricePerKwh) ?? [],
  );
  const maxPrice = Math.max(...allPrices, 1);

  const scored: ScoredStation[] = stations.map((s) => {
    const reliabilityScore = (s.reliabilityScore ?? 0) / 100;

    const availableCount = s.connectors?.filter((c) => c.status === 'AVAILABLE').length ?? 0;
    const totalCount = s.connectors?.length ?? 1;
    const availabilityScore = availableCount / totalCount;

    const distanceScore = 1 - (s.distanceKm ?? 0) / maxDistance;

    const minPrice = Math.min(...(s.connectors?.map((c) => c.pricePerKwh) ?? [maxPrice]));
    const priceScore = 1 - minPrice / maxPrice;

    const _score =
      reliabilityScore * 0.4 +
      availabilityScore * 0.3 +
      distanceScore * 0.2 +
      priceScore * 0.1;

    return { ...s, _score };
  });

  scored.sort((a, b) => b._score - a._score);

  // Annotate top stations with recommendation reasons when they beat
  // a closer, lower-reliability alternative
  return scored.map((s, i) => {
    const nearestIndex = scored.findIndex(
      (x) => (x.distanceKm ?? 0) < (s.distanceKm ?? 0),
    );
    if (
      i === 0 &&
      nearestIndex > 0 &&
      s.reliabilityScore !== undefined &&
      scored[nearestIndex].reliabilityScore !== undefined
    ) {
      const extraKm = ((s.distanceKm ?? 0) - (scored[nearestIndex].distanceKm ?? 0)).toFixed(
        1,
      );
      const relDiff = s.reliabilityScore! - scored[nearestIndex].reliabilityScore!;
      if (relDiff > 0) {
        return {
          ...s,
          recommendationReason: `${extraKm} km farther but ${relDiff}% more reliable`,
        };
      }
    }
    return s;
  });
}
