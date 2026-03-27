import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Protected routes that require authentication */
const PROTECTED_PATHS = ["/dashboard"];

/** Public paths that don't need auth */
const PUBLIC_PATHS = ["/login", "/api/auth"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Skip static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Check auth for protected paths
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const idToken = request.cookies.get("id_token")?.value;

  if (!idToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
