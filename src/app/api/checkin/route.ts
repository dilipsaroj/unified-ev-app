import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { scoreTier } from '@/lib/reliability';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stationId, connectorId, working } = await req.json();

    if (!stationId || !connectorId || typeof working !== 'boolean') {
      return NextResponse.json(
        { error: 'stationId, connectorId, and working (boolean) are required' },
        { status: 400 },
      );
    }

    const connector = await prisma.connector.findFirst({
      where: { id: connectorId, stationId },
    });

    if (!connector) {
      return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
    }

    await prisma.checkIn.create({
      data: { userId: user.id, stationId, connectorId, working },
    });

    // Seeded sampleSize is a prior (phantom samples), not CheckIn rows.
    // Blend only this new observation into that prior, then persist the new n.
    // Adding recentCheckIns.length would double-count rows already folded
    // into sampleSize on later writes.
    const phantomWorking =
      (connector.reliabilityScore * connector.sampleSize) / 100;
    const totalSamples = connector.sampleSize + 1;
    const totalWorking = phantomWorking + (working ? 1 : 0);
    const newScore = Math.round((totalWorking / totalSamples) * 100);

    const updatedConnector = await prisma.connector.update({
      where: { id: connectorId },
      data: {
        reliabilityScore: newScore,
        reliabilityTier: scoreTier(newScore),
        sampleSize: totalSamples,
        lastConfirmedAt: working ? new Date() : connector.lastConfirmedAt,
      },
    });

    return NextResponse.json({
      success: true,
      connectorId,
      reliabilityScore: updatedConnector.reliabilityScore,
      reliabilityTier: updatedConnector.reliabilityTier,
      sampleSize: updatedConnector.sampleSize,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('POST /api/checkin:', message);
    return NextResponse.json(
      { error: 'Failed to submit check-in', detail: message },
      { status: 500 },
    );
  }
}
