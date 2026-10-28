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
      // The quote is public, so a guest sees the price like anyone else.
      "POST /bookings/quote": (r) =>
        r.fulfill({
          json: {
            currency: "NGN",
            lines: [{ kind: "ticket", label: "Adult", quantity: 1, unit_amount: "5000", amount: "5000" }],
            subtotal: "5000",
            discount: "0",
            checkout_fee: "0",
            total: "5000",
            guests: 1,
            days: 1,
            promo_applied: false,
          },
        }),
    });
    await page.goto("/experiences/exp-1");
    await expect(page.getByRole("heading", { name: "Lagos Food Walk" }).first()).toBeVisible();
  });

  test("shows who hosts it and the booking panel, not a log-in wall", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Hosted by Kayan Thrille" })).toBeVisible();
    await expect(page.getByText("Log in to see your host")).toHaveCount(0);
    await expect(page.getByText("Log in to book")).toHaveCount(0);
    await expect(page.locator("div.sticky").getByRole("button", { name: /Book now/ })).toBeVisible();
  });

  test("Book now opens the checkout, which starts with email and phone", async ({ page }) => {
    await page.locator("div.sticky").getByRole("button", { name: /Book now/ }).click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole("heading", { name: "Confirm your details and pay" })).toBeVisible();
    await expect(page.getByText("Lagos Food Walk").first()).toBeVisible();
  });
});

test.describe("experience photos", () => {
  const PHOTOS = [1, 2, 3, 4, 5].map((n) => `https://photos.test/lagos-food-walk-${n}.jpg`);
  // A 1x1 PNG, so the page never loads a real photo.
  const PIXEL = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64",
  );

  test.beforeEach(async ({ page }) => {
    await page.route("https://photos.test/**", (r) => r.fulfill({ contentType: "image/png", body: PIXEL }));
    await mockApi(page, {
      "GET /experiences/exp-1": (r) => r.fulfill({ json: { ...EXPERIENCE, images: PHOTOS } }),
      "GET /experiences/exp-1/pricing": (r) =>
        r.fulfill({ json: { currency: "NGN", prices: [], addons: [], rules: [] } }),
      "GET /experiences/exp-1/sessions": (r) =>
        r.fulfill({ json: { timezone: "Africa/Lagos", scheduled: false, sessions: [] } }),
    });
    await page.goto("/experiences/exp-1");
    await expect(page.getByRole("heading", { name: "Lagos Food Walk" }).first()).toBeVisible();
  });

  test("View all opens every photo, one at a time", async ({ page }) => {
    await page.getByRole("button", { name: "View all 5 photos" }).click();
    const viewer = page.getByRole("dialog", { name: "Photo 1 of 5" });
    await expect(viewer).toBeVisible();

    await page.getByRole("button", { name: "Next photo" }).click();
    await expect(page.getByRole("dialog", { name: "Photo 2 of 5" })).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("dialog", { name: "Photo 5 of 5" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("clicking a photo opens the viewer on that photo", async ({ page }) => {
    await page.getByTestId("gallery-grid").getByRole("button", { name: "View photo 3 of 5" }).click();
    await expect(page.getByRole("dialog", { name: "Photo 3 of 5" })).toBeVisible();
  });
});
