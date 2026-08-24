import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stationId, rating, text } = await req.json();

    if (!stationId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'stationId and rating (1–5) are required' },
        { status: 400 },
      );
    }

    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: { cpoId: true },
    });
    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        stationId,
        rating,
        text: text ?? null,
        isCurated: false,
      },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json(
      {
        id: review.id,
        stationId: review.stationId,
        cpoId: station.cpoId,
        sessionId: null,
        userId: review.userId,
        userName: review.user.name ?? 'EV Driver',
        rating: review.rating,
        text: review.text ?? '',
        isCurated: review.isCurated,
        createdAt: review.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('POST /api/reviews:', message);
    return NextResponse.json(
      { error: 'Failed to submit review', detail: message },
      { status: 500 },
    );
  }
}
