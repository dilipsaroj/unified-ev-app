import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { aggregateReliability, scoreTier } from '@/lib/reliability';

export const dynamic = 'force-dynamic';

function mapConnectorStatus(status: string): string {
  return status === 'OFFLINE' ? 'UNAVAILABLE' : status;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const station = await prisma.station.findUnique({
      where: { id: params.id },
      include: { cpo: true, connectors: true },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

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

    return NextResponse.json({
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
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/stations/[id]:', message);
    return NextResponse.json(
      { error: 'Failed to fetch station', detail: message },
      { status: 500 },
    );
  }
}
