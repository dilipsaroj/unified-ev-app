import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

const COOKIE_NAME = 'ev-auth-phone'

/**
 * Returns the Prisma User for the authenticated caller, or null if not logged in.
 * Works in both dev and production — reads the ev-auth-phone cookie set by verify-otp.
 *
 * Usage in any API route:
 *   const user = await getAuthUser(req)
 *   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
export async function getAuthUser(req: NextRequest) {
  const phone = req.cookies.get(COOKIE_NAME)?.value
  if (!phone) return null

  return prisma.user.findUnique({ where: { phone } })
}
