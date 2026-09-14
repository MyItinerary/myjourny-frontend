# Architecture — myjourny-frontend

The public-facing MyJourny website. **Note:** this repo's own top-level README currently describes the app as "marketing-only" — that's out of date. In practice it's a fully authenticated product surface with real auth, bookings, profile management, and payment handoff, calling `itin` extensively. Worth fixing that README so it doesn't mislead the next person who opens the repo.

For the platform-wide picture (how this app fits alongside `itin`, `helm`, and `mobile-app`), see the [`myjourny-docs`](https://github.com/MyItinerary/myjourny-docs) repo — this file covers `myjourny-frontend` specifically.

## Stack

Next.js 16 (App Router, no `src/` directory) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (`base-nova` style) · TanStack Query v5 · Axios · `@react-oauth/google` · `motion` (animation) · `next-themes`.

## Local development

```bash
npm install && npm run dev
# → http://localhost:3000
```

## Structure

```
app/
├── page.tsx / content.tsx        # landing page (page.tsx renders content.tsx — repo-wide convention)
├── categories/[slug]/, cities/[slug]/, experiences/[id]/
├── login/, login/forgot-password/{check-email,reset,success}/
├── onboarding/                    # signup + preference quiz (budget, pace, interests, vibe, who-with, ...)
├── bookings/[id]/{success,cancel}/  # post-checkout redirect landing pages
├── profile/, profile/preferences/{budget,energy,interests,social,vibe}/
└── api/auth/session/route.ts       # sets/clears a non-sensitive session-presence cookie
```

## Auth

Google OAuth (`@react-oauth/google`, obtains a Google ID token client-side, exchanged with `itin`'s `/auth/google`) plus email/password against `/auth/register` and `/auth/login`.

**Token storage:** access + refresh JWTs live in `localStorage`. Route-edge logic (redirecting an already-authenticated user away from `/login`) uses a separate, non-sensitive httpOnly cookie that only flags session presence as a boolean — the real JWTs never travel as cookies, only via the `Authorization` header. That's a deliberate, sound design choice worth preserving as new routes are added. See the platform security assessment (`myjourny-docs/security/security-assessment.md`) for the localStorage-XSS tradeoff this still carries.

**Token refresh** is implemented here: a response interceptor catches `401`s, de-dupes concurrent refresh calls into one in-flight request, retries the original request once, and only forces logout if the refresh itself fails.

## Payments

Redirect-to-hosted-checkout, not an embedded payment element: booking creation returns a Stripe or Paystack checkout URL from `itin`, and the browser is redirected there directly (`window.location.href`). After payment, `itin` redirects back to this app's `/bookings/[id]/success` or `/cancel` pages. No payment SDK or secret lives in this repo.

## Configuration (env var names only)

`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (the same client ID shared with `mobile-app`).

**One config choice worth a second look:** `next.config.ts` allows images from any HTTPS host (`hostname: "**"`), because experience cover images are guide-uploaded to arbitrary CDNs rather than a fixed allowlist. Intentional, but broad.

## Testing

No test framework is configured, and no CI/CD pipeline exists in this repo.

## Related

- Platform-wide docs, diagrams, and the full security assessment: [`myjourny-docs`](https://github.com/MyItinerary/myjourny-docs)
