# Architecture — myjourny-frontend

The public-facing MyJourny website. It's a fully authenticated product surface (real auth, bookings, profile management and payment handoff) that calls `itin` extensively.

For the platform-wide picture (how this app fits alongside `itin`, `helm`, and `mobile-app`), see the [`myjourny-docs`](https://github.com/MyItinerary/myjourny-docs) repo — this file covers `myjourny-frontend` specifically.

## Stack

Next.js 16 (App Router, no `src/` directory) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (`base-nova` style) · TanStack Query v5 · Axios · `@react-oauth/google` · `motion` (animation) · `next-themes`. Tests: Vitest · React Testing Library · MSW · Playwright.

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
features/<feature>/                # MVVM: model/ (API + types), view-model/ (behaviour), view/ (UI), index.ts
lib/                               # shared infra: api-client, api-error, utils (+ legacy lib/queries)
components/ui|shared|icons|motion/ # shared presentational primitives (+ legacy components/<feature>/)
test/, e2e/                        # Vitest helpers + MSW; Playwright specs
```

New code follows **MVVM in feature folders**. Routes stay thin: `page.tsx` handles metadata and params, and `content.tsx` calls one view-model and renders one view. ESLint enforces the import direction (view → view-model → model), and `scripts/check-architecture.mjs` enforces co-located tests and the legacy ratchet. Code in `lib/queries/` and `components/<feature>/` predates the standard and is migrated as it is touched. See [CONTRIBUTING.md](../CONTRIBUTING.md).

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

- **Unit and component tests:** Vitest + React Testing Library + MSW (`npm run test`, `npm run test:coverage`). Tests sit next to their source. Coverage on `features/**` is gated at 80%.
- **E2E:** Playwright against a production build, with the itin API stubbed (`npm run test:e2e`). Auth, booking/checkout and payment pages require E2E.
- **CI:** there are two required checks for merging into `main`. `ci` (`.github/workflows/ci.yml`) is one job that runs lint, typecheck, the architecture check, unit tests with coverage, the build, and E2E against that build. `pr-format` (`.github/workflows/pr-format.yml`) checks the PR title, branch name and description checklist.

## Related

- Platform-wide docs, diagrams, and the full security assessment: [`myjourny-docs`](https://github.com/MyItinerary/myjourny-docs)
