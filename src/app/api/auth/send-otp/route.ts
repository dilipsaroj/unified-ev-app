import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be +91 followed by 10 digits.' },
        { status: 400 }
      )
    }

    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      // In dev: skip SMS entirely, hardcode OTP to 1234 (matches 4-box UI)
      console.log(`[DEV] OTP for ${phone}: 1234`)
      return NextResponse.json({ nonce: '' })
    }

    // Production: trigger SMS OTP via Supabase Phone Auth
    // Requires: Supabase dashboard → Authentication → Providers → Phone → Enable
    // and connect Twilio or MSG91 as the SMS provider
    const { error } = await supabaseAdmin.auth.signInWithOtp({ phone })

    if (error) {
      console.error('Supabase OTP error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ nonce: '' })
  } catch (err: any) {
    console.error('send-otp error:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
