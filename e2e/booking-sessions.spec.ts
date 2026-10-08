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
});
