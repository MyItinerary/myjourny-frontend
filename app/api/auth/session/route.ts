import { NextResponse } from "next/server";

// Sets/clears a minimal httpOnly flag cookie so `proxy.ts` can redirect
// authenticated users away from /login and /onboarding without needing to
// parse or verify a JWT at the edge. No token material lives in this
// cookie — the real access/refresh tokens stay client-side (see
// lib/auth/session-store.ts) and are only ever sent to itin via the
// Authorization header, never as a cookie.

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("myjourny_session", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("myjourny_session");
  return res;
}
