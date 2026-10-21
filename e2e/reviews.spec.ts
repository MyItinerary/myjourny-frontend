import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

const EXPERIENCE = {
  id: "exp-1",
  guide_id: "guide-1",
  status: "ACTIVE",
  title: "Makoko Floating Village Boat Tour",
  city: "Lagos",
  country: "Nigeria",
  currency: "NGN",
  duration_minutes: 90,
  group_size_min: 1,
  group_size_max: 6,
  rating: 4.5,
  review_count: 2,
  images: [],
  host: { id: "guide-1", display_name: "Kayan Thrille", is_verified: true },
};

function booking(status: string) {
  return {
    id: "b-1",
    user_id: "user-1",
    guide_id: "guide-1",
    experience_id: "exp-1",
    status,
    payment_status: "paid",
    payout_status: "pending",
    requested_datetime: "2026-06-01T08:00:00",
    session_timezone: "Africa/Lagos",
    party_size: 2,
    price_total: "15000.00",
    currency: "NGN",
    line_items: [],
    created_at: "2026-05-01T10:00:00",
    updated_at: "2026-05-01T10:00:00",
  };
}

async function signIn(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "adaeze@example.com", fullName: "Adaeze Okafor", avatarUrl: null },
      }),
    );
  });
}

function bookingApi(status: string, extra: Record<string, (r: Route) => unknown> = {}) {
  return {
    "GET /bookings/b-1": (r: Route) => r.fulfill({ json: booking(status) }),
    "GET /bookings/b-1/cancellation": (r: Route) => r.fulfill({ json: null }),
    "GET /experiences/exp-1": (r: Route) => r.fulfill({ json: EXPERIENCE }),
    ...extra,
  } as Record<string, (r: Route) => Promise<void>>;
}

test.beforeEach(async ({ page }) => {
  await page.route("https://www.openstreetmap.org/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<html><body>map</body></html>" }),
  );
});

test("after a completed experience the traveller rates it and sees their review", async ({ page }) => {
  await signIn(page);
  let posted: unknown = null;
  let reviewed = false;
  await mockApi(
    page,
    bookingApi("completed", {
      "GET /bookings/b-1/review": (r) =>
        r.fulfill({
          json: reviewed
            ? {
                can_review: false,
                review: {
                  id: "r-1",
                  booking_id: "b-1",
                  experience_id: "exp-1",
                  rating: 5,
                  comment: "Our guide grew up here and it showed",
                  is_hidden: false,
                  editable_until: "2099-01-01T00:00:00",
                  created_at: "2026-06-02T10:00:00",
                  updated_at: "2026-06-02T10:00:00",
                },
              }
            : { can_review: true },
        }),
      "POST /bookings/b-1/review": async (r) => {
        posted = r.request().postDataJSON();
        reviewed = true;
        await r.fulfill({ status: 201, json: { id: "r-1" } });
      },
    }),
  );

  await page.goto("/bookings/b-1");
  await expect(page.getByRole("heading", { name: "How was it?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Post review" })).toBeDisabled();

  await page.getByRole("radio", { name: "5 stars" }).click();
  await page.getByLabel("Tell others about it (optional)").fill("Our guide grew up here and it showed");
  await page.getByRole("button", { name: "Post review" }).click();

  await expect(page.getByRole("heading", { name: "Your review" })).toBeVisible();
  await expect(page.getByText("Our guide grew up here and it showed")).toBeVisible();
  expect(posted).toEqual({ rating: 5, comment: "Our guide grew up here and it showed" });
});

test("a booking that hasn't been completed has no review form", async ({ page }) => {
  await signIn(page);
  let asked = false;
  await mockApi(
    page,
    bookingApi("confirmed", {
      "GET /bookings/b-1/review": (r) => {
        asked = true;
        return r.fulfill({ json: { can_review: false } });
      },
    }),
  );

  await page.goto("/bookings/b-1");
  await expect(page.getByRole("heading", { name: "Receipt" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How was it?" })).toHaveCount(0);
  expect(asked).toBe(false);
});

test("the experience page lists real reviews with the rating and count", async ({ page }) => {
  await mockApi(page, {
    "GET /experiences/exp-1": (r) => r.fulfill({ json: EXPERIENCE }),
    "GET /experiences/exp-1/pricing": (r) =>
      r.fulfill({ json: { currency: "NGN", prices: [], addons: [], rules: [] } }),
    "GET /experiences/exp-1/sessions": (r) =>
      r.fulfill({ json: { timezone: "Africa/Lagos", scheduled: false, sessions: [] } }),
    "GET /experiences/exp-1/reviews": (r) =>
      r.fulfill({
        json: {
          items: [
            { id: "a", author_name: "Ireti G.", rating: 5, comment: "Unforgettable morning", created_at: "2026-06-02T10:00:00" },
            { id: "b", author_name: "Tunde O.", rating: 4, comment: null, created_at: "2026-05-20T10:00:00" },
          ],
          total: 2,
          page: 1,
          limit: 6,
          rating: 4.5,
        },
      }),
  });

  await page.goto("/experiences/exp-1");
  await expect(page.getByRole("heading", { name: /^4\.5/ })).toContainText("4.5 · 2 reviews");
  await expect(page.getByText("Unforgettable morning")).toBeVisible();
  await expect(page.getByText("Tunde O.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Show more reviews" })).toHaveCount(0);
});
