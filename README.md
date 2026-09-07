# myjourny-frontend

The public-facing MyJourny website — the marketing site for **MyJourny**, the travel marketplace connecting travellers with local guides for curated experiences.

## Problem

Finding an authentic, local-led travel experience is harder than it should be. Generic listing sites and map apps surface the same crowded landmarks and stale reviews, with no reliable way to tell which local guides are trustworthy, available, and worth paying. On the other side, local guides have no real marketplace: no easy way to list an experience, get discovered by the right traveller, take a booking, and actually get paid — so a lot of great local expertise never reaches the travellers who'd pay for it.

## Value proposition

MyJourny connects travellers with vetted local guides for bookable, curated experiences — verified guides, integrated payments and payouts, and semantic discovery, replacing generic listings with real local expertise.

This site is MyJourny's public front door — where a first-time visitor learns what the product is, why it's different from a generic listings site, and is pointed toward downloading the app or signing up, rather than being asked to trust an unfamiliar brand cold. It's marketing-only: beyond fetching marketing content, it doesn't call the [`itin`](https://github.com/MyItinerary/itin) API the way the mobile app and guide/admin portal do.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) (`base-nova` style, matching `admin`'s config)
- [TanStack Query](https://tanstack.com/query) for data fetching

This project mirrors the conventions used in the [`admin`](https://github.com/MyItinerary/admin) app: no `src/` dir, `@/*` import alias, npm as the package manager, and the same `components/providers.tsx` pattern (`QueryClientProvider` + `TooltipProvider` + `Toaster`).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result. Edit `app/page.tsx` — the page auto-updates as you edit.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)
