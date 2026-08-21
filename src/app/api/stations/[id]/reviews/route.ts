import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { stationId: params.id },
      include: {
        user: { select: { name: true } },
        station: { select: { cpoId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(
      reviews.map((r) => ({
        id: r.id,
        stationId: r.stationId,
        cpoId: r.station.cpoId,
        sessionId: null,
        userId: r.userId,
        userName: r.user.name ?? 'EV Driver',
        rating: r.rating,
        text: r.text ?? '',
        isCurated: r.isCurated,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/stations/[id]/reviews:', message);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', detail: message },
      { status: 500 },
    );
  }
}
