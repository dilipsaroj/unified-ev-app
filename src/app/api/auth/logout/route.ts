import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('ev-auth-phone', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // delete the cookie
  })
  return response
}
