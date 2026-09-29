import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 * See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 *
 * NextAuth v5 with `strategy: "jwt"` stores the session in a single cookie. The name
 * differs between plain http (dev) and https (production), so both are checked.
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

const PROTECTED_PREFIXES = ["/admin", "/guru", "/manajemen", "/notifikasi"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  // Role checks stay in the dashboard layouts; here we only guard against a
  // completely anonymous request so unauthenticated visitors never render a shell.
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except API routes, static assets and Next.js internals.
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
