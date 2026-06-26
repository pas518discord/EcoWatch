import { NextRequest, NextResponse } from "next/server"

// Route protection.
//
// Auth is only enforced once NextAuth is actually configured (NEXTAUTH_SECRET
// set). This keeps the demo dashboard (which renders from mock data) usable on
// a fresh clone while still locking the app down in any real deployment.
//
// We do a lightweight cookie-presence check here (Edge runtime) instead of
// importing the full auth config, which pulls in the AWS SDK and cannot run on
// the Edge.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
]

export function middleware(req: NextRequest) {
  if (!process.env.NEXTAUTH_SECRET) {
    return NextResponse.next()
  }

  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name))
  if (hasSession) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", req.url)
  loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

// Protect everything except auth endpoints, the login page, Next internals and
// static assets.
export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|icon.svg|icon-light-32x32.png|icon-dark-32x32.png|apple-icon.png|placeholder).*)",
  ],
}
