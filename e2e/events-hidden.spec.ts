import { expect, test } from "./fixtures";

// Production builds leave NEXT_PUBLIC_EVENTS_ENABLED unset, and so does this one.
test.describe("events are hidden until they launch", () => {
  test("the home page links nowhere near events", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await expect(page.locator('a[href="/events"]')).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Early bird ending soon" })).toHaveCount(0);
  });

  test("the events page is not found", async ({ page }) => {
    const response = await page.goto("/events");
    expect(response?.status()).toBe(404);
  });
});
