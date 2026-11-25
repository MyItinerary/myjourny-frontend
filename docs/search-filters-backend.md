# Search results filters: what the backend needs to provide

The results pages (`/cities/[slug]`, `/categories/[slug]`, `/search`) show the full filter set from Figma (node `2604:3855`). Every option below is **hardcoded** in
`features/search-results/model/filter-catalog.ts` until these endpoints exist. Only the rows marked "works today" actually change results.

## 1. What the listing endpoint takes today

`GET /experiences/filter` accepts `city`, `search`, a **single** `interest` slug, `price_min`, `price_max`, `duration_min`, `duration_max`, `time_of_day` (the values we send are `morning`, `afternoon`, `evening`, `late_night`; please confirm), `sort`, `page`, `limit`. It returns `{ items, total, ... }`.

Everything else in the UI is held in state and counted in the badge, but **does not change the results**.

## 2. Listing endpoint: parameters to add

All list params should accept repeats (`category=a&category=b`), as `category` does today.

| Filter in the UI | Param we'd send | Applies to |
|---|---|---|
| Type (Experiences / Events; none or both = everything) | `type=experiences\|events` (repeatable) | both |
| Category (multi-select, experience and event categories) | `category` (repeatable, slugs from §3) | both |
| Subcategory (taste-quiz users) | `subcategory` (repeatable) | both |
| Dates, incl. Tonight / This weekend / Next 7 days | `date_from`, `date_to` (ISO dates). A one-day pick sends the same date twice | both |
| Free | `free=true` | both |
| Price | `price_min`, `price_max` (per person for experiences, per ticket for events, all fees included) | both |
| Collections (Detty December, Eid, …) | `collection` (repeatable) | both |
| Area (Lekki, Victoria Island, …) | `area` (repeatable) | both |
| Setting | `setting=indoor\|outdoor` | both |
| Time of day | `time_of_day` (**repeatable**, today it is single) | both |
| Age (All ages, Family friendly, 18+, 21+) | `age` (repeatable) | both |
| Accessibility (Step-free, Wheelchair accessible) | `accessibility` (repeatable) | both |
| Booking (Instant book / Request to book) | `booking` (repeatable) | experiences |
| Free cancellation | `free_cancellation=true` | experiences |
| Verified host | `verified_host=true` | experiences |
| Host replies within 2 hours | `host_replies_within_hours=2` | experiences |
| Group size | `group_size=<n>` (experiences that fit n guests) | experiences |
| Fitness level (Easy, Moderate, Active) | `fitness` (repeatable) | experiences |
| Not weather dependent | `weather_independent=true` | experiences |
| What's included (Food, Drinks, Transport, Equipment, Photos) | `included` (repeatable) | experiences |
| Style (Shared, Private, One-on-one with the host) | `style` (repeatable) | experiences |
| Languages | `language` (repeatable) | experiences |
| Duration (Under 2h, 2 to 4h, Half day, Full day) | `duration_min`, `duration_max` (works today) | experiences |
| Genre (only after Music or Parties is selected) | `genre` (repeatable) | events |
| Seating (Seated / Standing) | `seating` (repeatable) | events |
| Student discount | `student_discount=true` | events |
| Dress code | `dress_code=true` | events |
| Hide sold out (on by default for Events) | `hide_sold_out=true` | events |
| Early bird on | `early_bird=true` | events |
| Transfers allowed | `transfers_allowed=true` | events |

The listing should return **both experiences and events** in one result set (each item needs a `type` so the card can render correctly), and the same `total` we use for the heading and the panel footer ("Show 12 events").

## 3. Catalogue endpoints (replace the hardcoded lists)

1. `GET /filters/categories` returns experience and event categories: `{ slug, label, type, popularity_rank }`. The row shows them mixed by popularity; the panel groups them by type.
2. Subcategories, either nested in the above or `GET /filters/categories/{slug}/subcategories`: `{ slug, label, parent_slug }`. Only shown to people who finished the taste quiz.
3. For the signed-in guest: their taste profile, so we can put their categories first with the "For you" dot, and pre-select "Picked for your taste". Something like `GET /profile/taste` returning `{ completed, category_slugs, subcategory_slugs }`.
4. Option lists for the chip groups: collections, areas (per city), settings, fitness levels, included items, styles, languages, genres, seating, age and accessibility options. One endpoint is fine: `GET /filters/options?type=experiences|events&city=…`.

## 4. Counts, so options can grey out

The design greys options with zero matches in the current results (Hausa and Eid in the sample) and updates the footer count live as filters change. That needs either:

- `GET /experiences/filter/facets` with the same filter params, returning `{ total, counts: { language: { Hausa: 0, … }, collection: { eid: 0, … }, … } }`, or
- the same `counts` object added to the listing response.

## 5. Smaller things

- Multiple categories at once (today `interest` is a single slug, so only the newest selected category is sent).
- Quiz flow: after the taste quiz the user should return to the results page with their filters kept (frontend will pass a `returnTo`; the quiz needs to honour it).
- Ordering of the "unselected categories" by popularity per city.
