import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

type Handlers = Record<string, (route: Route) => unknown>;

const KAYAK = {
  id: "11111111-1111-4111-8111-111111111111",
  status: "ACTIVE",
  title: "Lagoon kayak and breakfast",
  city: "Lagos",
  duration_minutes: 180,
  interest_tags: ["nature-outdoors"],
  schedule_type: "recurring",
  recurrence_days: ["sat"],
  start_times: ["07:30:00"],
  price_from: 15000,
  rating: 4.8,
  cover_image_url: null,
  missing_for_publish: [],
};
const MARKET = {
  id: "22222222-2222-4222-8222-222222222222",
  status: "INACTIVE",
  review_note: "Use a photo from the walk, not a stock image.",
  title: "Balogun market morning",
  city: "Lagos",
  duration_minutes: 120,
  interest_tags: ["street-life"],
  price_from: 9000,
  cover_image_url: null,
  missing_for_publish: [],
};
const POTTERY = {
  id: "33333333-3333-4333-8333-333333333333",
  status: "INACTIVE",
  title: "Pottery in Ikoyi",
  city: "Lagos",
  interest_tags: [],
  price_from: null,
  cover_image_url: null,
  missing_for_publish: ["pin", "photo"],
};

async function signIn(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "guide-1", email: "tunde@example.com", fullName: "Tunde Bakare", avatarUrl: null },
      }),
    );
  });
}

const me = (signup_type: string, guide_status: string) => (route: Route) =>
  route.fulfill({ json: { id: "guide-1", email: "tunde@example.com", full_name: "Tunde Bakare", signup_type, guide_status } });

async function openAsGuide(page: Page, path: string, overrides: Handlers = {}) {
  await signIn(page);
  await mockApi(page, {
    "GET /auth/me": me("guide", "approved"),
    "GET /categories": (r) =>
      r.fulfill({
        json: [
          { id: 1, parent_id: null, slug: "nature-outdoors", text: "Nature & outdoors", category_type: "interest", is_active: true, children: [] },
          { id: 2, parent_id: null, slug: "street-life", text: "Street life", category_type: "interest", is_active: true, children: [] },
        ],
      }),
    "GET /guide/experiences": (r) => r.fulfill({ json: [KAYAK, MARKET, POTTERY] }),
    ...overrides,
  });
  await page.goto(path);
}

test.describe("host dashboard access", () => {
  test("sends a signed-out visitor to log in, and back afterwards", async ({ page }) => {
    await page.goto("/host/dashboard/listings");
    await expect(page).toHaveURL(/\/login\?next=%2Fhost%2Fdashboard%2Flistings$/);
  });

  test("sends a traveller to become a guide", async ({ page }) => {
    await signIn(page);
    await mockApi(page, { "GET /auth/me": me("traveller", "none") });
    await page.goto("/host/dashboard");
    await expect(page).toHaveURL(/\/become-a-guide$/);
  });

  test("lets a guide in review look around, and says so", async ({ page }) => {
    await signIn(page);
    await mockApi(page, { "GET /auth/me": me("guide", "pending") });
    await page.goto("/host/dashboard/listings");
    await expect(page.getByRole("status")).toContainText("Your guide application is in review");
    await expect(page.getByRole("heading", { name: "Nothing here yet" })).toBeVisible();
  });
});

test.describe("a guide's listings", () => {
  test("shows each listing's real status, price and what needs fixing", async ({ page }) => {
    await openAsGuide(page, "/host/dashboard/listings");

    const table = page.getByRole("table", { name: "Your listings" });
    await expect(table.getByText("Lagoon kayak and breakfast")).toBeVisible();
    await expect(table.getByText("₦15,000")).toBeVisible();
    await expect(table.getByText("Nature & outdoors")).toBeVisible();
    await expect(table.getByText("Sat at 07:30")).toBeVisible();
    await expect(table.getByText("Taken down: Use a photo from the walk, not a stock image.")).toBeVisible();
    await expect(table.getByText("Still needs a map pin and a photo")).toBeVisible();
    await expect(page.getByText("3 listings · 1 live · 0 in review")).toBeVisible();
  });

  test("deletes a listing nobody has booked", async ({ page }) => {
    let deleted = "";
    let listed = 0;
    await openAsGuide(page, "/host/dashboard/listings", {
      "GET /guide/experiences": (r) => {
        listed += 1;
        return r.fulfill({ json: deleted ? [KAYAK, MARKET] : [KAYAK, MARKET, POTTERY] });
      },
      [`DELETE /experiences/${POTTERY.id}`]: (r) => {
        deleted = POTTERY.id;
        return r.fulfill({ status: 204 });
      },
    });

    await page.getByRole("button", { name: "Actions for Pottery in Ikoyi" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByRole("button", { name: "Delete and lose the reviews" }).click();

    await expect(page.getByText("Pottery in Ikoyi is deleted")).toBeVisible();
    await expect(page.getByRole("table", { name: "Your listings" }).getByText("Pottery in Ikoyi")).toHaveCount(0);
    expect(deleted).toBe(POTTERY.id);
    expect(listed).toBeGreaterThan(1);
  });

  test("says why a booked listing can't be deleted", async ({ page }) => {
    await openAsGuide(page, "/host/dashboard/listings", {
      [`DELETE /experiences/${KAYAK.id}`]: (r) =>
        r.fulfill({ status: 409, json: { detail: "This listing has bookings, so it can't be deleted." } }),
    });

    await page.getByRole("button", { name: "Actions for Lagoon kayak and breakfast" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByRole("button", { name: "Delete and lose the reviews" }).click();

    await expect(page.getByText("This listing has bookings, so it can't be deleted.")).toBeVisible();
  });

  test("opens a listing we took down, with our note", async ({ page }) => {
    await openAsGuide(page, `/host/dashboard/listings/${MARKET.id}`, {
      [`GET /guide/experiences/${MARKET.id}`]: (r) => r.fulfill({ json: MARKET }),
    });

    await expect(page.getByText("We took this listing down")).toBeVisible();
    await expect(page.getByText(/Use a photo from the walk, not a stock image\./)).toBeVisible();
  });
});
