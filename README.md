# myjourny-frontend

The public-facing MyJourny website — the marketing site for **MyJourny**, the travel marketplace connecting travellers with local guides for curated experiences.

# Environments
Dev => https://myjourny-frontend.vercel.app
Prod => https://myjourny.io

## Problem

Finding an authentic, local-led travel experience is harder than it should be. Generic listing sites and map apps surface the same crowded landmarks and stale reviews, with no reliable way to tell which local guides are trustworthy, available, and worth paying. On the other side, local guides have no real marketplace: no easy way to list an experience, get discovered by the right traveller, take a booking, and actually get paid — so a lot of great local expertise never reaches the travellers who'd pay for it.

## Value proposition

MyJourny connects travellers with vetted local guides for bookable, curated experiences — verified guides, integrated payments and payouts, and semantic discovery, replacing generic listings with real local expertise.

This site is MyJourny's public front door and a full product surface. Travellers discover experiences, sign up or log in, manage their profile and preferences, save wishlists, and book and pay, all against the [`itin`](https://github.com/MyItinerary/itin) API. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it fits together.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) (`base-nova` style, matching `admin`'s config)
- [TanStack Query](https://tanstack.com/query) for data fetching

- [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) + [MSW](https://mswjs.io) for unit and component tests, and [Playwright](https://playwright.dev) for E2E

## Conventions

New code follows **MVVM in feature folders** (`features/<feature>/{model,view-model,view}`), every feature ships with tests, and PRs follow a required format. CI and branch protection enforce all of this. **Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.** AI agents also follow [AGENTS.md](AGENTS.md).

Other conventions: no `src/` dir, the `@/*` import alias, npm as the package manager (Node 22, see `.nvmrc`), and `components/providers.tsx` for app-wide providers.

## Getting Started

```bash
npm ci
npm run dev        # http://localhost:3000
npm run check      # lint + typecheck + tests + architecture check (run before every push)
npm run test:e2e   # Playwright (run `npx playwright install chromium` once first)
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)
