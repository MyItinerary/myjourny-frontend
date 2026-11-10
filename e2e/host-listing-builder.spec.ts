import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

type Handlers = Record<string, (route: Route) => unknown>;

const ID = "44444444-4444-4444-8444-444444444444";
const PHOTO = (n: number) => `https://res.cloudinary.com/demo/kayak-${n}.jpg`;

// A listing we took down; everything else about it is complete.
const KAYAK = {
  id: ID,
  status: "INACTIVE",
  review_note: "Use a photo from the trip, not a stock image.",
  title: "Lagoon kayak and breakfast",
  headline: "Paddle across the lagoon at sunrise",
  description: "We meet at the jetty, paddle out past the fishing boats and eat breakfast on the sandbank as the sun comes up.",
  city: "Lagos",
  interest_tags: ["nature-outdoors"],
  meeting_landmark: "Five Cowries jetty",
  meeting_instructions: "The blue gate beside the jetty",
  meeting_photo_url: PHOTO(0),
  latitude: 6.44,
  longitude: 3.42,
  schedule_type: "recurring",
  recurrence_days: ["sat"],
  recurrence_interval: 1,
  start_times: ["07:30:00"],
  duration_minutes: 180,
  group_size_min: 2,
  group_size_max: 8,
  whats_included: ["Breakfast"],
  whats_not_included: ["Transport"],
  fitness_level: "moderate",
  age_policy: "all_ages",
  accessibility: "not_suitable",
  refund_policy: "non_refundable",
  images: [PHOTO(1), PHOTO(2), PHOTO(3), PHOTO(4)],
  missing_for_publish: [],
};

async function openBuilder(page: Page, overrides: Handlers) {
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
  await mockApi(page, {
    "GET /auth/me": (r) => r.fulfill({ json: { id: "guide-1", email: "tunde@example.com", signup_type: "guide", guide_status: "approved" } }),
    "GET /categories": (r) =>
      r.fulfill({ json: [{ id: 1, parent_id: null, slug: "nature-outdoors", text: "Nature & outdoors", category_type: "interest", is_active: true, children: [] }] }),
    [`GET /guide/experiences/${ID}`]: (r) => r.fulfill({ json: KAYAK }),
    [`GET /experiences/${ID}/pricing`]: (r) => r.fulfill({ json: { currency: "NGN", prices: [{ id: "p1", amount: "15000.00" }], addons: [], rules: [] } }),
    ...overrides,
  });
  await page.goto(`/host/dashboard/listings/new?id=${ID}`);
}

test.describe("the listing builder", () => {
  test("a guide fixes a listing we took down and publishes it again", async ({ page }) => {
    let saved: Record<string, unknown> | null = null;
    let repriced: unknown = null;
    await openBuilder(page, {
      [`PUT /experiences/${ID}`]: async (r) => {
        saved = r.request().postDataJSON() as Record<string, unknown>;
        return r.fulfill({ json: { ...KAYAK, status: "ACTIVE", review_note: null } });
      },
      [`PATCH /experiences/${ID}/prices/p1`]: async (r) => {
        repriced = r.request().postDataJSON();
        return r.fulfill({ json: {} });
      },
    });

    await expect(page.getByPlaceholder("Lagos Island Photowalk")).toHaveValue("Lagoon kayak and breakfast");
    await page.getByPlaceholder("Lagos Island Photowalk").fill("Sunrise lagoon kayak and breakfast");

    await page.getByRole("button", { name: /Group size and price/ }).first().click();
    await page.getByLabel(/^Price per person/).fill("18000");

    await page.getByRole("button", { name: /Review and (publish|save)/ }).first().click();
    await page.getByRole("button", { name: "Save and publish" }).click();

    await expect(page.getByText("Your changes are live")).toBeVisible();
    await expect(page).toHaveURL(/\/host\/dashboard\/listings$/);
    expect(saved).toMatchObject({
      title: "Sunrise lagoon kayak and breakfast",
      status: "ACTIVE",
      interest_tags: ["nature-outdoors"],
      recurrence_days: ["sat"],
      start_times: ["07:30"],
      fitness_level: "moderate",
      latitude: 6.44,
      cover_image_url: PHOTO(1),
    });
    expect(repriced).toEqual({ amount: 18000 });
  });

  test("a guide still in review can build a listing but not publish it", async ({ page }) => {
    await openBuilder(page, {
      "GET /auth/me": (r) => r.fulfill({ json: { id: "guide-1", email: "tunde@example.com", signup_type: "guide", guide_status: "pending" } }),
    });

    await expect(page.getByPlaceholder("Lagos Island Photowalk")).toHaveValue("Lagoon kayak and breakfast");
    await page.getByRole("button", { name: /Review and (publish|save)/ }).first().click();
    await expect(page.getByText("You can publish once your guide application is approved.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save and publish" })).toBeDisabled();
  });
});
