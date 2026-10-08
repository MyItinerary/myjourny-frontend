import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

// The experience runs in Lagos. Sessions and dates come from itin in Lagos
// time, whatever the browser's zone.
const EXPERIENCE = {
  id: "exp-1",
  guide_id: "guide-1",
  status: "ACTIVE",
  title: "Lagos Food Walk",
  headline: "Street food",
  description: "Eat your way through Lagos.",
  city: "Lagos",
  country: "Nigeria",
  currency: "NGN",
  duration_minutes: 180,
  group_size_min: 1,
  group_size_max: 10,
  is_featured: false,
  images: [],
  media: [],
  created_at: "2026-01-01T00:00:00",
  updated_at: "2026-01-01T00:00:00",
};

const inDays = (days: number) => {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toISOString().slice(0, 10);
};
const SESSION_DAY = inDays(5);
const STARTS_AT = `${SESSION_DAY}T08:00:00Z`;

const sessions = (seatsLeft: number) => ({
  timezone: "Africa/Lagos",
  scheduled: true,
  sessions: [
    { starts_at: STARTS_AT, local_date: SESSION_DAY, local_time: "09:00:00", seats_left: seatsLeft, sold_out: seatsLeft === 0 },
  ],
});

const quote = {
  currency: "NGN",
  lines: [{ kind: "ticket", label: "Adult", quantity: 1, unit_amount: "5000", amount: "5000" }],
  subtotal: "5000",
  discount: "0",
  checkout_fee: "0",
  total: "5000",
  guests: 1,
  days: 1,
  promo_applied: false,
};

async function openExperience(page: Page, overrides: Record<string, (route: Route) => unknown> = {}) {
  // Signed in: guests can't see the guide, so they can't book.
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "traveller@example.com", fullName: "Traveller", avatarUrl: null },
      }),
    );
  });
  await mockApi(page, {
    "GET /experiences/exp-1": (r) => r.fulfill({ json: EXPERIENCE }),
    "GET /experience-prices": (r) => r.fulfill({ json: [{ id: "adult", experience_id: "exp-1", label: "Adult", amount: 5000 }] }),
    "GET /experiences/exp-1/pricing": (r) =>
      r.fulfill({
        json: {
          currency: "NGN",
          prices: [{ id: "adult", label: "Adult", amount: "5000", pricing_unit: "per_person" }],
          addons: [],
          rules: [],
        },
      }),
    "GET /experiences/exp-1/sessions": (r) => r.fulfill({ json: sessions(8) }),
    "POST /bookings/quote": (r) => r.fulfill({ json: quote }),
    ...overrides,
  });
  await page.goto("/experiences/exp-1");
  await expect(page.getByRole("heading", { name: "Lagos Food Walk" }).first()).toBeVisible();
}

// The desktop sidebar panel (the mobile sheet is a second copy, closed).
const panel = (page: Page) => page.locator("div.sticky").filter({ hasText: "Book now" });

test.describe("booking sessions", () => {
  test.use({ timezoneId: "America/Los_Angeles" });

  test("shows Lagos session times in a Los Angeles browser, with no preview link", async ({ page }) => {
    await openExperience(page);

    await expect(panel(page).getByRole("button", { name: /9:00 AM/ })).toBeVisible();
    await expect(panel(page).getByText("Times are Lagos time.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Preview/ })).toHaveCount(0);
  });

  test("caps guests at the seats left in the session", async ({ page }) => {
    await openExperience(page, {
      "GET /experiences/exp-1/sessions": (r) => r.fulfill({ json: sessions(1) }),
    });

    await expect(panel(page).getByText("1 left")).toBeVisible();
    await expect(panel(page).getByRole("button", { name: "Increase Participants" })).toBeDisabled();
  });

  test("shows the server's message and fresh seats when the session fills up", async ({ page }) => {
    let sessionLoads = 0;
    await openExperience(page, {
      "GET /experiences/exp-1/sessions": (r) => {
        sessionLoads += 1;
        return r.fulfill({ json: sessions(sessionLoads > 1 ? 0 : 8) });
      },
      "POST /bookings": (r) => r.fulfill({ status: 409, json: { detail: "This date is sold out" } }),
    });

    await panel(page).getByRole("button", { name: /Book now/ }).click();

    await expect(page.getByText("This date is sold out")).toBeVisible();
    // Sessions were reloaded: the only session is now full.
    await expect(panel(page).getByText("All upcoming sessions are sold out.")).toBeVisible();
  });

  test("shows a multi-day session's dates and doesn't ask for days", async ({ page }) => {
    const quotes: Record<string, unknown>[] = [];
    await openExperience(page, {
      "GET /experiences/exp-1": (r) =>
        r.fulfill({
          json: { ...EXPERIENCE, schedule_type: "recurring", recurrence_type: "weekly", recurrence_days: ["sat"], length_days: 3 },
        }),
      "GET /experiences/exp-1/pricing": (r) =>
        r.fulfill({
          json: {
            currency: "NGN",
            prices: [{ id: "pass", label: "Day pass", amount: "5000", pricing_unit: "per_day" }],
            addons: [],
            rules: [],
          },
        }),
      "GET /experiences/exp-1/sessions": (r) =>
        r.fulfill({
          json: {
            ...sessions(8),
            length_days: 3,
            sessions: [{ ...sessions(8).sessions[0], end_local_date: inDays(7), ends_at: `${inDays(7)}T10:00:00Z` }],
          },
        }),
      "POST /bookings/quote": async (r) => {
        quotes.push(r.request().postDataJSON());
        await r.fulfill({
          json: {
            ...quote,
            days: 3,
            days_fixed: true,
            session_starts_at: STARTS_AT,
            session_ends_at: `${inDays(7)}T10:00:00Z`,
            timezone: "Africa/Lagos",
          },
        });
      },
    });

    await expect(panel(page).getByText("Every Saturday · 3 days")).toBeVisible();
    await expect(panel(page).getByText("Each booking covers all 3 days.")).toBeVisible();
    await expect(panel(page).getByRole("button", { name: "Increase days" })).toHaveCount(0);
    await expect(panel(page).getByText(/ – /).first()).toBeVisible();
    expect(quotes.at(-1)).not.toHaveProperty("days");
  });

  test("books an unscheduled experience by date", async ({ page }) => {
    const quotes: Record<string, unknown>[] = [];
    await openExperience(page, {
      "GET /experiences/exp-1/sessions": (r) => r.fulfill({ json: { timezone: "Africa/Lagos", scheduled: false, sessions: [] } }),
      "POST /bookings/quote": async (r) => {
        quotes.push(r.request().postDataJSON());
        await r.fulfill({ json: quote });
      },
    });

    await expect(panel(page).getByText(/The host will confirm the start time/)).toBeVisible();
    await expect.poll(() => quotes.length).toBeGreaterThan(0);
    // The date, not a guessed time in the browser's zone.
    expect(quotes.at(-1)).toHaveProperty("requested_date");
    expect(quotes.at(-1)).not.toHaveProperty("requested_datetime");
  });

  test("prices only bookable selections and shows each discount", async ({ page }) => {
    const bookBefore = `${inDays(30)}T00:00:00`;
    const quotes: Record<string, unknown>[] = [];
    await openExperience(page, {
      "GET /experiences/exp-1": (r) => r.fulfill({ json: { ...EXPERIENCE, group_size_min: 3 } }),
      "GET /experiences/exp-1/pricing": (r) =>
        r.fulfill({
          json: {
            currency: "NGN",
            prices: [{ id: "adult", label: "Adult", amount: "5000", pricing_unit: "per_person" }],
            addons: [],
            rules: [
              { id: "g", kind: "group", min_guests: 3, percent_off: "10.00" },
              { id: "e", kind: "early_bird", book_before: bookBefore, percent_off: "1.00" },
            ],
          },
        }),
      "POST /bookings/quote": async (r) => {
        quotes.push(r.request().postDataJSON());
        await r.fulfill({
          json: {
            ...quote,
            lines: [
              {
                kind: "ticket",
                label: "Adult",
                quantity: 3,
                unit_amount: "4950",
                amount: "14850",
                list_unit_amount: "5000",
                list_amount: "15000",
              },
              { kind: "discount", label: "Group discount (10% off 3+ guests)", quantity: 1, unit_amount: "-1485", amount: "-1485" },
              { kind: "fee", label: "Payment processing fee", quantity: 1, unit_amount: "300.48", amount: "300.48" },
            ],
            subtotal: "14850",
            subtotal_before_discounts: "15000",
            discount: "1485",
            checkout_fee: "300.48",
            total: "13665.48",
            guests: 3,
            savings: [
              { kind: "early_bird", label: "Early-bird discount (1% off)", amount: "150" },
              { kind: "group", label: "Group discount (10% off 3+ guests)", amount: "1485" },
            ],
          },
        });
      },
    });
    const sidebar = page.locator("div.sticky").filter({ hasText: "Free cancellation" });

    await expect(sidebar.getByText("10% group discount applied (3+ guests)")).toBeVisible();
    await expect(sidebar.getByText("Early-bird and group discounts combine.")).toBeVisible();
    await expect(sidebar.getByText("₦15,000.00", { exact: true }).first()).toBeVisible();
    await expect(sidebar.getByText("Early-bird discount (1% off)")).toBeVisible();
    await expect(sidebar.getByText("−₦1,485.00")).toBeVisible();
    await expect(sidebar.getByText("You save ₦1,635.00")).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "Book now - ₦13,665.48" })).toBeEnabled();

    // Below the minimum group size nothing is priced or bookable.
    const quotesBefore = quotes.length;
    await sidebar.getByRole("button", { name: "Decrease Participants" }).click();
    await expect(sidebar.getByText("This experience needs at least 3 guests.")).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "Select at least 3 guests" })).toBeDisabled();
    await expect(sidebar.getByText("Total")).toHaveCount(0);
    await expect(sidebar.getByText("Payment processing fee")).toHaveCount(0);
    expect(quotes.length).toBe(quotesBefore);
  });
});
