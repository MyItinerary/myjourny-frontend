# Design system — status

Source of truth: Figma "Web app Designs SSOT" (`zpXoDrobqCWdkWfmoepne4`).
Tracks what's confirmed from Figma vs. still placeholder.

## Confirmed tokens

- **Font — TikTok Sans.** Display sizes (headlines) use the `TikTok Sans
  18pt` optical-size instance at ExtraBold; body/label sizes use plain
  `TikTok Sans` at Regular/Medium/SemiBold. Wired in
  [app/layout.tsx](app/layout.tsx) as a variable font, exposed as
  `--font-sans` in [app/globals.css](app/globals.css). One deliberate
  exception: the filter `Chips` component uses `Neue Haas Grotesk
  Display Pro`, not TikTok Sans — implemented as designed, not "fixed".
- **Palette** (`:root`/`.dark` in [app/globals.css](app/globals.css)):
  primary CTA `#2C0101` ("Continue" buttons, nav "Get started"), brand
  accent `#F5032D` (links, eyebrow labels, "Show more"), foreground
  `#333134`, muted-foreground `#6F6B72`, border `#E0DFDD`, muted bg
  `#F4F2EE`. Note `--primary` (CTA color) and `--brand` (link/accent
  color) are deliberately separate tokens — don't collapse them.
  Destructive/chart/sidebar tokens have no Figma spec — left as shadcn
  defaults. Dark mode isn't in the Figma file; derived, not
  designer-verified.
- **Type scale** (via `get_variable_defs`): Display/3 52px, Display/5
  44px, Display/6 40px (all ExtraBold); Heading/8 18px SemiBold;
  Label/4 20px, Label/5 18px, Label/6 16px, Label/7 14px (Medium);
  Body/2 20px, Body/4 16px, Body/5 14px, Body/6 12px (Regular).

## Onboarding / auth flow — done

All routes built, typechecked, built, and screenshot-verified against
Figma at both breakpoints (desktop 1440px / mobile 393px). Flow order:

**Auth** (`app/onboarding/`, `app/login/`):
1. **Sign up** (`/onboarding`) — `2068:24661`/`2068:25512`. Split
   layout: [components/onboarding/auth-form.tsx](components/onboarding/auth-form.tsx)
   left, [onboarding-slide.tsx](components/onboarding/onboarding-slide.tsx)
   hero photo right.
2. **Email step** (`/onboarding/email`) — `2068:24874`/`2068:25697`.
   Reuses `AuthForm`.
3. **Password step** (`/onboarding/password`) — `2068:24915`+dup
   `2068:24962` / `2068:25734`+dup `2068:25773`. New
   [password-form.tsx](components/onboarding/password-form.tsx) (two
   [password-input.tsx](components/onboarding/password-input.tsx)
   fields + info row).
4. **Login** (`/login`) — `2068:24743`+dup `2068:24830` /
   `2068:25586`+dup `2068:25657`. New
   [login-form.tsx](components/onboarding/login-form.tsx) (email +
   password + "Forgot password?").
5. **Forgot password** (`/login/forgot-password`,
   `.../check-email`, `.../reset`, `.../success`) — `2068:24787`+dup
   `2068:24802`, `2068:24817`, `2068:24939`+dup `2068:24986`,
   `2068:25009`. Reuses `AuthForm` (Google/terms hidden),
   `PasswordForm`, and the plain split shell for the no-form Success
   screen.

Screens 1–5 all share
[auth-screen-layout.tsx](components/onboarding/auth-screen-layout.tsx)
(logo, heading/subtitle at Display/7 32px desktop · Display/8 24px
mobile, hero photo panel). Known simplification: per-screen heading
wrap-width/line-break points aren't pixel-tuned per screen (generic
container width instead) — a deliberate small tradeoff for reuse
across 6+ screens, not an oversight.

**Preference questions** (`app/onboarding/`):
6. **Intro** (`/onboarding/get-to-know-you`) — `2068:25022`/`2068:25821`.
7. **Pace** (`/onboarding/pace`) — `2068:25046`+`2068:25080` /
   `2068:25851`+`2068:25879`.
8. **Interests** (`/onboarding/interests`) — `2068:25114`+`2068:25178`
   / `2068:26001`+`2068:26053`.
9. **Who you go with** (`/onboarding/who-with`) — `2068:25242`+`2068:25286`
   / `2068:26233`+`2068:26263`.
10. **Budget** (`/onboarding/budget`) — `2068:25330`+`2068:25370` /
    `2068:26105`+`2068:26135`.
11. **What lights you up** (`/onboarding/vibe`) — `2068:25410`+`2068:25450`
    / `2068:26165`+`2068:26199`.
12. **Curating** (`/onboarding/curating`, final loading) —
    `2068:25490`/`2068:25907`.

Shared Figma components across these: `Myjourny logo update`,
`Large Buttons` (pill CTA), `Check box pills` (selectable option,
variants 2–9), `Header section` / `Bottom banner` (mobile), `Input`.
[components/onboarding/interstitial-screen.tsx](components/onboarding/interstitial-screen.tsx)
covers Intro/Curating (gradient bg, no hero photo — a different shell
from the auth screens above); `illustration={null}` opts out of its
default placeholder box entirely.

**Not built / known gaps:** Curating's mobile decorative
floating-chip background (cosmetic only, disclosed in
[app/onboarding/curating/page.tsx](app/onboarding/curating/page.tsx));
`/legal/terms`, `/legal/privacy`, `/login/forgot-password` target
pages exist only as links, not built pages; no real backend — every
"Continue" just navigates client-side.

## Homepage ✅ (guest + onboarded account)

Real frames (file `zpXoDrobqCWdkWfmoepne4`), all named "Home" — supersedes
the `2001:18041`/`2001:18055`/`2001:8471`-as-standalone-page notes from an
earlier, now-stale pass over the file:

- Guest desktop `2001:9142` / mobile `2001:9168`
- Onboarded account desktop `2001:9152` / mobile `2001:9462`

Both states share the same 9 sections — **Hero, Why book with us, Popular
experiences near you, Discover by categories, Top picks right now,
Discover by cities, Based on your browsing history, CTA, Footer** — just
reordered: guests see "Why book with us" before the personalized rails;
onboarded accounts see "Popular experiences near you" promoted right after
Hero, ahead of the generic marketing section. The Hero/top nav
(`2001:7998`) is pixel-identical between the two states (no avatar/signed-in
nav yet). "Discover by categories" is the one section with a real Figma-side
content difference: its `onboarded` boolean prop swaps the generic top-level
categories for personalized subcategories (`2001:8436` guest /
`2001:8471` onboarded).

Implemented in `app/page.tsx` + `app/content.tsx` and `components/home/*`
(see Component library below). Guest-vs-account state is read from a
temporary `lib/mock-session.ts` mock session hook, not real auth — see
that file's header comment.

## Categories ✅ (single-category listing)

`/categories/[slug]` — Figma "Home" (desktop `2001:11985` / mobile
`2001:12375`): breadcrumb (desktop only) + heading + `Chips` filter row
(new [filter-chip.tsx](components/categories/filter-chip.tsx),
[category-header.tsx](components/categories/category-header.tsx)) +
a grid of `ExperienceCardVertical` with a "See more" expand
([category-results-grid.tsx](components/categories/category-results-grid.tsx))
+ the same `CitiesSection`/`ExperienceRailSection`/`Footer` as the
homepage. Mobile's back+search header is page-specific, inlined in
`content.tsx` (no other page uses that compact search bar yet).
`lib/mock-data/home.ts`'s `categoriesBySlug`/`getCategoryListing` back
the route; unknown slugs 404. `CategoriesSection`'s pills
(homepage) now link to this route — previously inert `<div>`s.

The "Onboarded account"/"Guest view" Figma links given alongside this
task turned out to be redundant re-exports of the already-built
Homepage (`2001:9142`/`2001:9152` etc.) plus two isolated instances of
`CategoriesSection` at its collapsed/expanded pill counts — confirmed
`VISIBLE_COUNT = 7` there is correct; no new work from that half of the
request.

## Spacing/sizing alignment audit — Homepage + Categories ✅

Numeric pass over both breakpoints, replacing the earlier screenshot-only
verification: exact-dimension Figma reference screenshots pixel-diffed
against live section crops (`pixelmatch`), plus direct comparison of
`get_design_context`'s x/y/width/height/gap specs against the Tailwind
classes. All 9 homepage sections + the Categories page are now within 1–2px
of spec at both breakpoints, with two real bugs found and fixed along the
way:

- **`CitiesSection`** used `aspect-[251/170]` (the Categories page's wider
  cities grid ratio) on the Homepage's narrower 900px/4-col grid — should
  be `aspect-[207/170]`. Also added desktop/mobile section padding, grid
  gaps, and a `variant="home" | "category"` prop (4-col 900px vs. 5-col
  1213px column, left- vs. centered heading) since the component is now
  shared pixel-exact across both pages.
- **`guestCategories`** mock data had exactly 7 items (`VISIBLE_COUNT`),
  so `hasMore` was always `false` and the "See more" row Figma's own
  reference always shows never rendered — added an 8th category. This
  alone closed a 40px section-height gap.

Other fixes applied (padding/margin/line-height corrected to Figma's exact
px values, not estimated): `HeroSection` (nav-to-content offset, SearchBar
given its own absolute-positioned offset instead of sharing the headline's
flex gap, mobile "Where to?" compact pill), `WhyBookWithUsSection`
(padding/grid-gap, mobile single-column + bottom CTA), `CategoriesSection`
(padding/gaps, mobile horizontal-scroll pill wrap), `ExperienceRailSection`
(desktop "Popular experiences" is a static 2×3 grid with no carousel per
Figma, not a carousel like the other two rails; "Top picks"/"Based on
browsing history" carousels get their arrows in the header row, not below;
added `wide` prop for the Categories page's 1212px column), `CtaSection`
(mobile left-aligned/40px vs. desktop centered/48px heading), `Footer`
(72px seam between the inspiration-tabs block and the link columns, not
48px; 22px heading not 20px; mobile stacked-column gaps).

**Known accepted variance** (not spacing bugs, left as-is): a few
paragraphs (`WhyBookWithUsSection` feature descriptions on mobile,
`CategoriesSection`'s mobile heading) wrap to a different line count than
Figma's exact reference at the same box width — font-metric/kerning
variance between our rendered TikTok Sans and Figma's, not a padding/gap
issue. Figma's own footer column heights are also internally inconsistent
(two 5-link columns spec'd at different heights) — not chased. Per the
audit's scope, sub-pixel glyph/line-wrap drift wasn't pursued further;
section-level and component-level spacing was the target and is solid.

**Not yet re-audited this pass**: the 12 onboarding/auth screens (built
and screenshot-verified earlier in the project, not yet numerically
pixel-diffed against Figma the way the sections above were).

## Other flows — explored, not yet implemented

- **Search**: `106:1182`, a large composed page (Hero + search bar +
  results grid + the same homepage recommendation sections below).
- **Experiences (detail page)**: `106:1183` — a full experience detail
  page ("Sunrise Kayaking at Tarkwa Bay"): gallery, itinerary, host
  card, reviews, booking card, similar experiences.
- **Experience card**: implemented in
  [components/experiences/experience-card.tsx](components/experiences/experience-card.tsx)
  (horizontal rail card, node `2001:18088`) and
  [components/experiences/experience-card-vertical.tsx](components/experiences/experience-card-vertical.tsx)
  (full-photo card used by "Top picks right now"/category grid, node
  `2001:8528`) — colors and icons now real.

## Still placeholder

- **Icons**: `star-01`, `heart`/`heart-rounded`, `chevron-down`,
  `home-smile`, `image-05` are now real Figma exports
  ([components/icons/shared-icons.tsx](components/icons/shared-icons.tsx),
  [nav-icons.tsx](components/icons/nav-icons.tsx)). Still lucide
  placeholders: `chevron-right` (rail arrows), `search-lg` on mobile
  category header (reuses the existing `public/icons/search-lg.svg` art
  but not yet confirmed pixel-exact for that specific compact usage).
- **Images**: components take `imageSrc` as a prop. Downloaded and
  committed so far: onboarding hero photo
  ([public/images/onboarding/curated-around-you.png](public/images/onboarding/curated-around-you.png)),
  homepage city photos
  ([public/images/home/cities/](public/images/home/cities/), 8 cities),
  and one placeholder experience photo reused across all experience
  cards ([public/images/home/experiences/kayaking.jpg](public/images/home/experiences/kayaking.jpg)
  — Figma itself reuses one lorem experience everywhere, so this mirrors
  that rather than inventing distinct photos). Figma asset URLs expire
  ~7 days — never hardcode one into committed code.

## Component library

`components/ui/` (shadcn, `base-nova` style, `neutral` base color per
[components.json](components.json)): `button`, `badge`, `card`, `input`,
`tabs`, `avatar`, `separator`, `carousel`, `skeleton`, `sonner`, `tooltip`.

`components/<feature>/`: `experiences/experience-card.tsx` +
`experience-card-vertical.tsx`; `onboarding/` — `onboarding-slide`,
`onboarding-logo`, `auth-screen-layout`, `auth-form`, `password-input`,
`password-form`, `login-form`, `interstitial-screen`, `checkbox-pill`,
`pill-question-screen`, `onboarding-header`, `onboarding-bottom-bar`.
`components/icons/` — icon sets inlined from real Figma SVG exports
(`onboarding-icons`, `interests-icons`, `who-with-icons`,
`budget-icons`, `vibe-icons`, `auth-icons`, `shared-icons` — chevron/
heart/star reused across features, `nav-icons` — `HomeNav`'s 3 icons).

`components/home/`: `home-nav`, `hero-section`,
`why-book-with-us-section`, `experience-rail-section` (shared by
"Popular experiences near you" / "Top picks right now" / "Based on your
browsing history"), `categories-section`, `cities-section`,
`cta-section`, `footer`, `mock-session-toggle` (dev-only guest/account
preview switch — see `lib/mock-session.ts`).

`components/categories/`: `category-header`, `filter-chip`,
`category-results-grid`.

`lib/mock-data/home.ts` holds the hardcoded experiences/categories/
cities fixtures (no backend yet, same convention as onboarding's inline
`options` arrays).
