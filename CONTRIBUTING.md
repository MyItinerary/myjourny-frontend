# Contributing to myjourny-frontend

These rules apply to **everyone who pushes code here, people and AI agents alike**. Most of them are enforced by CI and branch protection, so a PR that breaks them can't be merged. AI agents: also read [AGENTS.md](AGENTS.md).

- [Setup](#setup)
- [Architecture: MVVM](#architecture-mvvm)
- [Testing](#testing)
- [Branches, commits and PRs](#branches-commits-and-prs)
- [What blocks a merge](#what-blocks-a-merge)
- [Legacy ratchet](#legacy-ratchet)
- [Who reviews what](#who-reviews-what)
- [Changing these rules](#changing-these-rules)

---

## Setup

```bash
nvm use                         # Node 22 (.nvmrc)
npm ci
npx playwright install chromium # once, for E2E
npm run dev                     # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run check` | **Run this before every push.** It runs lint, typecheck, unit tests with coverage, and the architecture check. |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright against a production build, with the API mocked |
| `npm run lint` / `typecheck` / `test` / `test:coverage` / `check:architecture` | Each step of `check` on its own |

---

## Architecture: MVVM

New features live in `features/<feature>/` and are split into three layers. Dependencies point **one way only**: View → ViewModel → Model.

```
features/<feature>/
  model/                        # Data: talks to the itin API
    <thing>.ts                  #   TanStack Query hooks via apiClient, query keys, mappers
    <thing>.types.ts            #   DTOs and domain types (views may import these)
    <thing>.test.ts
  view-model/                   # Behaviour: what the screen does
    use-<screen>-view-model.ts  #   returns a typed <Screen>ViewModel object
    use-<screen>-view-model.test.ts
  view/                         # Presentation: what the screen looks like
    <screen>-view.tsx           #   props in, callbacks out
    <screen>-view.test.tsx
  index.ts                      # Public API: the only thing other code imports
```

### What each layer may do

| Layer | Owns | May import | Must NOT |
|---|---|---|---|
| **Model** `model/` | API calls (`apiClient`), `useQuery`/`useMutation` hooks, query keys, DTO types, pure mappers/formatters | `@/lib/*`, `@tanstack/react-query` | Render JSX. Call `toast`, `useRouter`/`next/navigation`. Import components, views or view-models. |
| **ViewModel** `view-model/` | Screen state (forms, selection, steps), validation, derived data, event handlers, side effects (toast, navigation, analytics) | Its own `model/`, other features' `index.ts`, `@/lib/*`, `sonner`, `next/navigation` | Render JSX. Import `apiClient`/`axios` (go through the model). Import views. |
| **View** `view/` | Markup, styling, layout, a11y. Purely UI state (open/closed, hover). | `@/components/ui|shared|icons|motion`, `../model/*.types`, other views | Fetch data, or import `@tanstack/react-query`, `apiClient`, `axios` or model hooks. |
| **Route** `app/**` | `page.tsx`: metadata and params. `content.tsx`: call **one** view-model and render **one** view. | `@/features/<feature>` | Hold logic, call data hooks, or import `apiClient`/`axios`/TanStack Query. |
| **Shared** `lib/`, `components/ui|shared|icons|motion` | Infrastructure (`api-client`, `api-error`, `utils`) and generic presentational primitives | Each other, as needed | `lib/` must not import `components/` or `features/`. |

**Imports:**
- Inside a feature, use relative imports (`../model/experiences`).
- From anywhere else, import only the public index (`@/features/experiences`). Deep imports such as `@/features/experiences/model/...` are a lint error.

### The shape of a screen

```ts
// features/experiences/view-model/use-experience-detail-view-model.ts
export type ExperienceDetailViewModel = {
  experience: ExperienceDetail | undefined;
  isLoading: boolean;
  isSaved: boolean;
  onToggleSave: () => void;
};

export function useExperienceDetailViewModel(id: string): ExperienceDetailViewModel {
  const detail = useExperienceDetail(id);            // model hook
  const toggle = useToggleSaved();                   // model hook
  const isSaved = useSavedExperienceIds().data?.includes(id) ?? false;
  return {
    experience: detail.data,
    isLoading: detail.isPending,
    isSaved,
    onToggleSave: () =>
      toggle.mutate(id, { onError: (e) => toast.error(apiErrorMessage(e, "Couldn't save")) }),
  };
}
```

```tsx
// features/experiences/view/experience-detail-view.tsx
export function ExperienceDetailView({ experience, isLoading, isSaved, onToggleSave }: ExperienceDetailViewModel) {
  if (isLoading) return <ExperienceDetailSkeleton />;
  /* …markup only… */
}
```

```tsx
// app/experiences/[id]/content.tsx
"use client";
import { ExperienceDetailView, useExperienceDetailViewModel } from "@/features/experiences";

export function ExperienceDetailContent({ id }: { id: string }) {
  const vm = useExperienceDetailViewModel(id);
  return <ExperienceDetailView {...vm} />;
}
```

### Guidelines lint can't check

- One view-model per screen or major widget. If a view-model passes about 150 lines, split it into smaller hooks inside `view-model/`.
- Keep views small. Lint warns above 250 lines; split into sub-views long before that.
- Errors are raised in the model and handled in the view-model. The model throws or returns the error, and the view-model decides whether to toast, redirect or show inline.
- Views receive plain data and callbacks. Never pass a query or mutation object into a view.

---

## Testing

The stack is **Vitest**, **React Testing Library** and **MSW** for unit and component tests, plus **Playwright** for E2E.

| What | Required test | Where |
|---|---|---|
| Model hook or mapper | Unit test. API mocked with MSW (`server.use(http.get(apiUrl("/x"), …))`). | `model/<thing>.test.ts` |
| View-model | Hook test with `renderHookWithProviders`, covering states and every handler | `view-model/use-…-view-model.test.ts` |
| View | Render and interaction test with `renderWithProviders`, by role/label, no snapshots | `view/<screen>-view.test.tsx` |
| Critical flow: auth, booking/checkout, payment success/cancel | Playwright spec, API stubbed with `mockApi()` | `e2e/<flow>.spec.ts` |
| Bug fix | A test that fails before the fix and passes after | Next to the code |

**Rules:**
- Every source file in `features/**/{model,view-model,view}` needs a sibling `*.test.ts(x)`. Only `index.ts` and `*.types.ts` are exempt. CI fails if one is missing.
- Coverage on `features/**` must stay **≥ 80%** for lines, branches, functions and statements.
- `.only`, `.skip` and `.fixme` are not allowed. Every test runs in CI.
- Tests never hit the network. MSW fails any unhandled request, and E2E stubs the whole API.
- Helpers live in `test/utils/render.tsx` and `test/msw/`. Reuse them rather than wiring up providers by hand.

---

## Branches, commits and PRs

**Branch names:** `<type>/<kebab-case>`, for example `feat/search-date-filter` or `fix/login-redirect`.

**PR titles** follow [Conventional Commits](https://www.conventionalcommits.org): `<type>(<scope>): <summary>`.

| type | use for | tests required? |
|---|---|---|
| `feat` | new user-facing behaviour | **yes** |
| `fix` | bug fix | **yes** |
| `refactor` | restructuring with no behaviour change, including legacy → MVVM migrations | **yes** |
| `perf` | performance | **yes** |
| `test` | tests only | no |
| `docs` | docs only | no |
| `chore` | tooling, deps, config | no |

The scope is the feature, e.g. `experiences`, `auth`, `booking`, `profile`. PRs are squash-merged, and the PR title becomes the commit message on `main`.

**PR description:** fill in every section of the template (`.github/pull_request_template.md`) and tick every box. If an item doesn't apply, tick it and write `N/A — <reason>`. Don't delete it. Never tick a box for something you didn't do.

**Size:** aim for under ~400 changed lines (excluding lockfiles and generated files). Split large features into stacked PRs: model first, then view-model, then view.

---

## What blocks a merge

`main` is protected. Nobody can push to it directly, admins included. A PR can merge only when **all** of these hold:

There are two required checks, plus review:

| Check | Step | Fails when |
|---|---|---|
| **`ci`** | Lint | ESLint errors, including MVVM import-boundary violations |
| | Typecheck | `tsc --noEmit` errors |
| | Architecture check | New files in legacy dirs, a missing co-located test, a feature without `index.ts`, `eslint-disable` of boundary rules, or `.only`/`.skip` |
| | Unit tests + coverage | A Vitest test fails, or `features/**` coverage drops below 80% |
| | Build | `next build` fails |
| | E2E tests | A Playwright spec fails |
| **`pr-format`** | | The title isn't Conventional Commits, the branch name doesn't match, a template section is empty, a box is unticked, or a `feat`/`fix`/`refactor`/`perf` PR changes no test files |
| Review | | No approval yet from a code-owner team. See [Who reviews what](#who-reviews-what). |

`ci` runs its steps in order and stops at the first failure. Open the failed step in the Actions log to see which gate tripped. `npm run check` runs every `ci` step except build and E2E.

The branch must also be up to date with `main`, and all review threads must be resolved.

---

## Legacy ratchet

Code written before this standard (`lib/queries/*`, `components/<feature>/*`, logic-heavy `content.tsx`) is grandfathered, with three rules:

1. **No new files** in `lib/queries/` or `components/<feature>/`. Only `components/ui`, `shared`, `icons` and `motion` stay open. New tests for legacy code are welcome anywhere.
2. **Touching legacy code means migrating it.** If a PR adds behaviour to a legacy file or rewrites roughly half of it, move that slice into `features/` in the same PR, using a `refactor(...)` commit with tests. Small fixes may stay in place, but they still need a test.
3. **The allowlists only shrink.** `eslint.config.mjs` downgrades a few known legacy violations to warnings, file by file. When you fix one, remove the file from the list. Never add one.

---

## Who reviews what

Review ownership is set in `.github/CODEOWNERS` and assigned to GitHub teams, not individuals. A PR needs approval from a team that owns the files it changes. If several teams are listed for a path, approval from any one of them counts. GitHub requests reviews from the owning teams automatically.

| Team | Owns | Approves |
|---|---|---|
| `@MyItinerary/frontend-reviewers` | All app code: `features/`, `app/`, `components/`, `lib/`, tests | Day-to-day PRs |
| `@MyItinerary/frontend-leads` | The guardrails (listed below) | Changes to the rules themselves |
| `@MyItinerary/engineering-manager` | Everything (co-owner) | Any PR. This is the escalation path when the other teams are unavailable. |

You can't approve your own PR, so at least one other member of an owning team must review it. To join or leave a team, ask a frontend lead.

## Changing these rules

The guardrails belong to `frontend-leads` and `engineering-manager`. `frontend-reviewers` alone cannot approve changes to them. They are: `.github/`, `eslint.config.mjs`, `scripts/check-architecture.mjs`, the Vitest and Playwright configs, `package.json`/`package-lock.json`, `tsconfig.json`, `AGENTS.md`, `CLAUDE.md`, `.cursor/` and this file. To change one, open a PR with the reason. Weakening a guardrail to get a PR through (lowering a threshold, adding to an allowlist, disabling a rule) will be rejected.
