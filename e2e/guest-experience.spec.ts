import { expect, mockApi, test } from "./fixtures";

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const SESSION_DAY = inDays(5);

const EXPERIENCE = {
  id: "exp-1",
  guide_id: "guide-1",
  status: "ACTIVE",
  title: "Lagos Food Walk",
  description: "Eat your way through Lagos.",
  city: "Lagos",
  country: "Nigeria",
  currency: "NGN",
  duration_minutes: 180,
  group_size_min: 1,
  group_size_max: 10,
  images: [],
  host: { id: "guide-1", display_name: "Kayan Thrille", is_verified: true },
};

// No auth in localStorage: this is a guest following a shared link.
test.describe("experience page for a guest", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, {
      "GET /experiences/exp-1": (r) => r.fulfill({ json: EXPERIENCE }),
      "GET /experiences/exp-1/pricing": (r) =>
        r.fulfill({
          json: {
            currency: "NGN",
            prices: [{ id: "adult", label: "Adult", amount: "5000", pricing_unit: "per_person" }],
            addons: [],
            rules: [],
          },
        }),
      "GET /experiences/exp-1/sessions": (r) =>
        r.fulfill({
          json: {
            timezone: "Africa/Lagos",
            scheduled: true,
            sessions: [
              { starts_at: `${SESSION_DAY}T08:00:00Z`, local_date: SESSION_DAY, local_time: "09:00:00", seats_left: 8, sold_out: false },
            ],
          },
        }),
      // The quote needs an account; a guest still gets the panel.
      "POST /bookings/quote": (r) => r.fulfill({ status: 401, json: { detail: "Not authenticated" } }),
    });
    await page.goto("/experiences/exp-1");
    await expect(page.getByRole("heading", { name: "Lagos Food Walk" }).first()).toBeVisible();
  });

  test("shows the host and the booking panel, not a log-in wall", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Kayan Thrille" })).toBeVisible();
    await expect(page.getByText("Log in to see your host")).toHaveCount(0);
    await expect(page.getByText("Log in to book")).toHaveCount(0);
    await expect(page.locator("div.sticky").getByRole("button", { name: /Book now/ })).toBeVisible();
  });

  test("Book now starts checkout by asking for the guest's details", async ({ page }) => {
    await page.locator("div.sticky").getByRole("button", { name: /Book now/ }).click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole("heading", { name: "Confirm your details and pay" })).toBeVisible();
    await expect(page.getByText("Lagos Food Walk").first()).toBeVisible();
  });
});
