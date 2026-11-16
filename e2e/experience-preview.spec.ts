import type { Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

// A listing that was taken down: itin only shows it to a request with its preview token.
const EXPERIENCE = {
  id: "exp-1",
  guide_id: "guide-1",
  status: "INACTIVE",
  title: "Badagry Heritage Walk",
  city: "Badagry",
  country: "Nigeria",
  currency: "NGN",
  duration_minutes: 180,
  group_size_min: 1,
  group_size_max: 8,
  images: [],
  host: { id: "guide-1", display_name: "Kemi Adeyemi", is_verified: true },
};

const withToken = (fulfill: (route: Route) => Promise<void>) => async (route: Route) => {
  if (route.request().headers()["x-preview-token"] === "tok") return fulfill(route);
  return route.fulfill({ status: 404, json: { detail: "Experience not found" } });
};

test.beforeEach(async ({ page }) => {
  await mockApi(page, {
    "GET /experiences/exp-1": withToken((r) => r.fulfill({ json: EXPERIENCE })),
    "GET /experiences/exp-1/pricing": (r) =>
      r.fulfill({
        json: {
          currency: "NGN",
          prices: [{ id: "p1", experience_id: "exp-1", label: "Adult", amount: "12000.00", unit: "per_person", is_active: true }],
          addons: [],
          rules: [],
        },
      }),
    "GET /experiences/exp-1/sessions": withToken((r) =>
      r.fulfill({ json: { timezone: "Africa/Lagos", scheduled: false, sessions: [] } }),
    ),
  });
});

test("a preview link shows a listing that isn't live, with booking off", async ({ page }) => {
  await page.goto("/experiences/exp-1/preview#t=tok");

  await expect(page.getByRole("heading", { level: 1, name: "Badagry Heritage Walk" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Preview · Not live" })).toBeVisible();
  await expect(page).toHaveURL(/\/experiences\/exp-1\/preview$/);
  await expect(page.getByRole("button", { name: "Share" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Preview only" }).first()).toBeDisabled();

  // A reload in the same tab still works without the token in the address bar.
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Badagry Heritage Walk" })).toBeVisible();
});

test("without a token the preview says the link has expired, and the public page stays hidden", async ({ page }) => {
  await page.goto("/experiences/exp-1/preview");
  await expect(page.getByText("This preview link has expired")).toBeVisible();

  await page.goto("/experiences/exp-1");
  await expect(page.getByText("Couldn't load this experience")).toBeVisible();
});
