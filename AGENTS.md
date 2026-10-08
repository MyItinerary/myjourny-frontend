<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MyJourny engineering rules (binding for every AI agent)

These rules are enforced by CI and branch protection. A PR that breaks them **cannot merge**, so follow them from the start. The full standard, with examples, is in [CONTRIBUTING.md](CONTRIBUTING.md). Read it before writing feature code.

## Architecture: MVVM in feature folders

- New feature code goes in `features/<feature>/{model,view-model,view}/` plus an `index.ts` public API.
  - **model/**: `apiClient` calls, TanStack Query hooks, DTO types (`*.types.ts`), mappers. No JSX, no `toast`, no `next/navigation`, no component imports.
  - **view-model/**: `use<Screen>ViewModel()` hooks that return a typed object of data and callbacks. They hold state, validation, handlers, toasts and navigation. No JSX, no `apiClient`/`axios`, no view imports.
  - **view/**: presentational `.tsx` only. Props in, callbacks out. No data hooks, `apiClient`, `axios` or TanStack Query. May import `../model/*.types`.
- `app/**/page.tsx` handles metadata and params. `app/**/content.tsx` only does `const vm = useXViewModel(...); return <XView {...vm} />`.
- Import other features only via `@/features/<feature>`. Never deep-import. Inside a feature, use relative imports.
- **Do not add files** to `lib/queries/` or `components/<feature>/`. These are legacy and closed. If you must substantially change a legacy file, migrate it into `features/` instead.

## Tests are mandatory

- Every new or changed file in `features/**/{model,view-model,view}` gets a sibling `*.test.ts(x)` (Vitest + RTL + MSW). Use `test/utils/render.tsx` and `test/msw/`.
- Changes to auth, booking/checkout or payment pages also need a Playwright spec in `e2e/` that uses `mockApi()`.
- Bug fixes include a test that would have caught the bug.
- Never use `.only`, `.skip` or `.fixme`. Never hit the real network.

## Before you open or update a PR

1. Run `npm run check`, plus `npm run test:e2e` for critical flows. Both must pass. If something fails, fix the code, not the test or the rule.
2. Name the branch `<type>/<kebab-case>`. Title the PR `<type>(<scope>): <summary>`, where type is one of feat, fix, refactor, perf, test, docs or chore.
3. Fill in every required section of `.github/pull_request_template.md`. Write for a reviewer or PM who hasn't read the code:
   - Lead with what changes for users. Under "Product behaviour", say who is affected and give a `Before:` and an `After:` line, or write `No user-facing change — <reason>` (not allowed for feat, fix or perf).
   - Under "How to verify", list steps someone can follow on the preview.
   - Keep "Technical notes" to a few bullets. Under "Tests", describe the behaviour each test covers, not CI output.
   - Under "AI assistance", name the agent and what it wrote.
4. Tick a checklist box only if it is actually true. If an item doesn't apply, write `N/A — <reason>`.

## Never do these unless the engineering manager explicitly asks

- Edit `eslint.config.mjs`, `scripts/check-architecture.mjs`, the Vitest/Playwright configs, coverage thresholds, `.github/` (workflows, template, CODEOWNERS) or this file.
- Add `eslint-disable` for `no-restricted-imports`, or add files to a legacy allowlist.
- Push to `main`, force-push shared branches, or bypass hooks/checks (`--no-verify`).
- Delete or weaken an existing test to make a change pass.
