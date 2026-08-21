import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { aggregateReliability, scoreTier } from '@/lib/reliability';

export const dynamic = 'force-dynamic';

function mapConnectorStatus(status: string): string {
  return status === 'OFFLINE' ? 'UNAVAILABLE' : status;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '19.076');
    const lng = parseFloat(searchParams.get('lng') || '72.877');
    const radius = parseFloat(searchParams.get('radius') || '25');

    // Subquery required — PostgreSQL does not allow HAVING without GROUP BY
    const raw = await prisma.$queryRaw<Array<{ id: string; distance: number }>>`
      SELECT id, distance FROM (
        SELECT id,
          (6371 * acos(
            LEAST(1.0,
              cos(radians(${lat})) * cos(radians(lat)) *
              cos(radians(lng) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(lat))
            )
          )) AS distance
        FROM "Station"
      ) AS sub
      WHERE distance < ${radius}
      ORDER BY distance
      LIMIT 60
    `;

    if (raw.length === 0) {
      return NextResponse.json([]);
    }

    const ids = raw.map((r) => r.id);
    const distanceMap = Object.fromEntries(raw.map((r) => [r.id, r.distance]));

    const stations = await prisma.station.findMany({
      where: { id: { in: ids } },
      include: { cpo: true, connectors: true },
    });

    const result = stations.map((station) => {
      const reliabilityScores = station.connectors.map((c) => ({
        connectorId: c.id,
        scorePct: c.reliabilityScore,
        sampleSize: c.sampleSize,
        windowDays: 30,
        lastConfirmedAt: c.lastConfirmedAt?.toISOString() ?? '',
      }));

      let avgScore = aggregateReliability(reliabilityScores);
      // Seeded connectors may have a score but sampleSize 0; weighted avg is then 0.
      if (avgScore === 0 && station.connectors.length > 0) {
        avgScore = Math.round(
          station.connectors.reduce((sum, c) => sum + c.reliabilityScore, 0) /
            station.connectors.length,
        );
      }
      const reliabilityTier = scoreTier(avgScore);

      const confirmedDates = station.connectors
        .map((c) => c.lastConfirmedAt)
        .filter((d): d is Date => d !== null);
      const lastConfirmedAt =
        confirmedDates.length > 0
          ? new Date(Math.max(...confirmedDates.map((d) => d.getTime()))).toISOString()
          : null;

      return {
        id: station.id,
        cpoId: station.cpoId,
        name: station.name,
        address: station.address,
        coordinates: { lat: station.lat, lng: station.lng },
        amenities: station.amenities,
        isActive: true,
        avgWaitMins: station.avgWaitMins,
        bestTimeToCharge: station.bestTime ?? 'Morning',
        trafficLevel: station.trafficLevel,
        reliabilityScore: avgScore,
        reliabilityTier,
        _lastConfirmedAt: lastConfirmedAt,
        distanceKm: distanceMap[station.id] ?? null,
        cpo: station.cpo
          ? {
              id: station.cpo.id,
              name: station.cpo.name,
              logoUrl: station.cpo.logoUrl ?? '',
              chipColor: station.cpo.chipColor ?? '#94A3B8',
              protocol: 'OCPI',
            }
          : undefined,
        connectors: station.connectors.map((c) => ({
          id: c.id,
          stationId: c.stationId,
          cpoId: station.cpoId,
          identifier: c.id,
          type: c.type,
          maxPowerKw: c.maxPowerKw,
          pricePerKwh: c.pricePerKwh,
          status: mapConnectorStatus(c.status),
          reliability: {
            connectorId: c.id,
            scorePct: c.reliabilityScore,
            sampleSize: c.sampleSize,
            windowDays: 30,
            lastConfirmedAt: c.lastConfirmedAt?.toISOString() ?? null,
          },
        })),
      };
    });

    // Re-sort by distance (findMany doesn't preserve order)
    result.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/stations error:', message);
    return NextResponse.json(
      { error: 'Failed to fetch stations', detail: message },
      { status: 500 },
    );
  }
}
