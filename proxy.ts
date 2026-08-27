import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same NextRequest/
// NextResponse API, same config.matcher, just a renamed file/export) — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.

// Authenticated users shouldn't be able to revisit the logged-out
// sign-in screens (login, incl. /login/forgot-password/*, and the pre-auth
// /onboarding + /onboarding/password steps). This is deliberately NOT the
// whole /onboarding/* subtree — the preference screens after that
// (get-to-know-you, pace, interests, who-with, budget, vibe, curating) are
// only ever reached *while* authenticated (right after register/Google
// auth succeeds), so they must stay reachable for a signed-in user.
function isAuthOnlyRoute(pathname: string) {
  return pathname.startsWith("/login") || pathname === "/onboarding" || pathname === "/onboarding/password";
}

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.get("myjourny_session")?.value === "1";
  const { pathname } = request.nextUrl;

  if (hasSession && isAuthOnlyRoute(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login/:path*", "/onboarding", "/onboarding/password"],
};
