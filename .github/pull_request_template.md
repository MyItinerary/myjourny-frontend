<!--
PR title MUST follow Conventional Commits:  <type>(<scope>): <summary>
  types: feat | fix | refactor | perf | test | docs | chore
  e.g.   feat(experiences): add date filter to search
Branch MUST be named <type>/<kebab-case>, e.g. feat/search-date-filter.

Every section below is required. Replace each placeholder comment with real
content. A CI check (`pr-format`) blocks merge if a section is empty or a
checklist box is unticked. If an item truly doesn't apply, tick it and append
"N/A — <reason>".
-->

## Summary
<!-- What does this PR do and why? 1–3 sentences. -->

## Linked issue
<!-- Ticket / issue link, or "None — <reason>". -->

## Type
<!-- One of: feat | fix | refactor | perf | test | docs | chore -->

## What changed (by MVVM layer)
<!--
- model:      …
- view-model: …
- view:       …
- routes (app/): …
- other (config, docs, tooling): …
Write "none" for layers you didn't touch.
-->

## How it was tested
<!--
List the test files added/changed and what they cover, plus any manual testing.
Paste the tail of `npm run check` (and `npm run test:e2e` if relevant).
-->

## Screenshots / recording
<!-- Required for any UI change (before/after, desktop + mobile). Otherwise "N/A — no UI change". -->

## Risk & rollback
<!-- What could break? How do we roll back? -->

## AI assistance
<!-- "None", or which agent/tool was used and which parts it wrote. -->

## Checklist
- [ ] Follows the MVVM structure in CONTRIBUTING.md — no data access (`apiClient`, `axios`, TanStack Query) in views or `app/` routes
- [ ] New/changed logic is covered by tests, and `npm run check` passes locally
- [ ] E2E (`e2e/`) added/updated if this touches auth, booking/checkout or payment pages, and `npm run test:e2e` passes
- [ ] No new files in legacy dirs (`lib/queries/`, `components/<feature>/`); any legacy file substantially changed here has been migrated to `features/`
- [ ] UI matches Figma / DESIGN-SYSTEM.md, and screenshots are attached
- [ ] No secrets, env values, `console.log` or debug code; docs updated if behaviour changed
- [ ] I have read and understood every line of this PR, including any AI-generated code
