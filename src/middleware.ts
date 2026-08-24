import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'ev-auth-phone'

// Routes that require login — matched as startsWith
const PROTECTED_ROUTES = [
  '/map',
  '/session',
  '/passport',
  '/scan',
  '/profile',
  '/route',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))

  // Only redirect from /onboarding root — NOT /onboarding/vehicle or /onboarding/otp
  // (those pages are part of the auth/setup flow itself)
  const isOnboardingRoot = pathname === '/onboarding'

  const phone = req.cookies.get(COOKIE_NAME)?.value
  const isAuthenticated = Boolean(phone)

  if (isProtected && !isAuthenticated) {
    const url = req.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  // If already logged in, skip the sign-in entry screen
  // But allow /onboarding/vehicle (vehicle setup after first login)
  if (isOnboardingRoot && isAuthenticated) {
    const url = req.nextUrl.clone()
    url.pathname = '/map'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon|icons|manifest|api).*)',
  ],
}
