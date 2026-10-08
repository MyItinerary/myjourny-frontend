<!--
PR title MUST follow Conventional Commits:  <type>(<scope>): <summary>
  types: feat | fix | refactor | perf | test | docs | chore
  e.g.   feat(experiences): add date filter to search
Branch MUST be named <type>/<kebab-case>, e.g. feat/search-date-filter.

Write for a reviewer or PM who hasn't read the code: lead with what changes
for the people using MyJourny, then the engineering detail.

Sections are required unless marked optional. A CI check (`pr-format`) blocks
merge if a required section is empty, "Product behaviour" has no Before/After,
or a checklist box is unticked. If an item truly doesn't apply, tick it and
append "N/A — <reason>".
-->

## Summary
<!-- 1–3 plain-language sentences: what changes for users, and why. No file or function names. -->

## Linked issue
<!-- Ticket / issue link, or "None — <reason>". -->

## Type
<!-- One of: feat | fix | refactor | perf | test | docs | chore -->

## Product behaviour
<!--
Who's affected: traveller | guide | admin | internal only
Before: what people saw or could do before this PR.
After:  what they see or can do now.

Example:
Who's affected: traveller
Before: Multi-day sessions showed only the start date, so travellers thought they were booking one day.
After: The session shows its full range ("Sat, June 1 – Mon, June 3") and the price says "Each booking covers all 3 days."

For refactor / test / docs / chore PRs only, write instead:
No user-facing change — <reason>
-->

## How to verify
<!--
Numbered steps a reviewer or QA person can follow on the Vercel preview, with what they should see.
1. Open …
2. Click …
3. You should see …
-->

## Screenshots / recording
<!-- Optional, but expected for any visible change: before/after, desktop + mobile. -->

## Technical notes
<!--
Optional. A few bullets, only what a reviewer needs to know: new API fields or
endpoints, legacy files migrated, trade-offs, anything non-obvious.
Don't list every file or layer; the diff shows that.
-->

## Tests
<!--
One line per test file or e2e spec, describing the behaviour it covers, e.g.
- e2e/booking-sessions.spec.ts: a 3-day session shows its range and no days stepper.
No need to paste `npm run check` output; the `ci` check shows it.
-->

## Risk & rollback
<!-- What could users see break if this is wrong? How do we undo it? -->

## AI assistance
<!-- "None", or which agent/tool was used and which parts it wrote. -->

## Checklist
- [ ] "Product behaviour" and "How to verify" describe what this PR actually does (or say "No user-facing change")
- [ ] I followed "How to verify" myself, locally or on the preview
- [ ] New/changed logic is covered by tests, and `npm run check` passes locally
- [ ] E2E (`e2e/`) added/updated if this touches auth, booking/checkout or payment pages, and `npm run test:e2e` passes
- [ ] Follows the MVVM structure in CONTRIBUTING.md, with no new files in legacy dirs (`lib/queries/`, `components/<feature>/`)
- [ ] UI matches Figma / DESIGN-SYSTEM.md and works on mobile; no secrets, `console.log` or debug code
