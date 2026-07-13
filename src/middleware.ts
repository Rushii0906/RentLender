import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("samarth_session")?.value;
  const { pathname } = request.nextUrl;

  // Exclude assets, public files, next internals, and login page
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    // If user is already logged in and tries to access /login, redirect to Dashboard
    if (session && pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if no active session
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
