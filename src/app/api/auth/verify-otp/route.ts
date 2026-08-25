import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const COOKIE_NAME = 'ev-auth-phone'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { phone, token } = await req.json()

    if (!phone || !token) {
      return NextResponse.json({ error: 'phone and token are required' }, { status: 400 })
    }

    if (!/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone format. Use +91XXXXXXXXXX' }, { status: 400 })
    }

    // Hardcoded OTP — no SMS provider wired yet
    if (token !== '1234') {
      return NextResponse.json({ error: 'Invalid OTP (use 1234)' }, { status: 401 })
    }

    const user = await prisma.user.upsert({
      where: { phone },
      update: { updatedAt: new Date() },
      create: { phone },
      include: {
        vehicles: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    const primaryVehicle = user.vehicles[0] ?? null

    const responseBody = {
      id: user.id,
      phone: user.phone,
      name: user.name ?? 'EV Driver',
      vehicleId: primaryVehicle?.id ?? null,
      createdAt: user.createdAt.toISOString(),
    }

    const response = NextResponse.json(responseBody)
    response.cookies.set(COOKIE_NAME, phone, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (err: any) {
    console.error('verify-otp error:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
