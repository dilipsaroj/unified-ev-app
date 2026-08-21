import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import prisma from '@/lib/prisma'

const COOKIE_NAME = 'ev-auth-phone'

export async function POST(req: NextRequest) {
  try {
    const { phone, token } = await req.json()

    if (!phone || !token) {
      return NextResponse.json({ error: 'phone and token are required' }, { status: 400 })
    }

    if (!/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone format. Use +91XXXXXXXXXX' }, { status: 400 })
    }

    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev) {
      // Production: verify with Supabase
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return req.cookies.getAll() },
            setAll() {}, // we set our own cookie below
          },
        }
      )

      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      })

      if (error || !data.user) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
      }
    } else {
      // Dev: accept hardcoded 1234 only
      if (token !== '1234') {
        return NextResponse.json({ error: 'Invalid OTP (dev: use 1234)' }, { status: 401 })
      }
    }

    // Upsert User in Prisma — create on first login, return existing on repeat
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

    // Set httpOnly cookie — middleware reads this for route protection
    // This is intentionally a plain phone string (no session token) since
    // Supabase session is managed separately in production
    const response = NextResponse.json(responseBody)
    response.cookies.set(COOKIE_NAME, phone, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // No maxAge = session cookie (clears on browser close)
      // Add maxAge: 60 * 60 * 24 * 30 to persist 30 days
    })

    return response
  } catch (err: any) {
    console.error('verify-otp error:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
