import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be +91 followed by 10 digits.' },
        { status: 400 }
      )
    }

    // Dev OTP — no SMS provider wired yet
    // Production SMS (Twilio/MSG91) is Layer 2
    console.log(`[send-otp] OTP for ${phone}: 1234`)
    return NextResponse.json({ nonce: 'demo' })
  } catch (err: any) {
    console.error('send-otp error:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
