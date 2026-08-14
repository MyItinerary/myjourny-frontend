# myjourny-frontend

The public-facing MyJourny website — the marketing site for the travel marketplace connecting travellers with local guides for curated experiences.

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
