import { devices, type Page } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

// A phone. Pixel rather than iPhone: an iPhone preset switches the browser to
// WebKit, which a spec can't do.
const pixel: Record<string, unknown> = { ...devices["Pixel 7"] };
delete pixel.defaultBrowserType;
test.use(pixel);

async function signIn(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "ngozi@example.com", fullName: "Ngozi Bello", avatarUrl: null },
      }),
    );
  });
}

const tabBar = (page: Page) => page.getByRole("navigation", { name: "Main" });

test("the bottom bar reaches every main section, and Search opens the search sheet", async ({ page }) => {
  await page.goto("/");

  await expect(tabBar(page).getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  await expect(tabBar(page).getByRole("link", { name: "Wishlists" })).toBeVisible();
  await expect(tabBar(page).getByRole("link", { name: "Trips" })).toBeVisible();

  await tabBar(page).getByRole("button", { name: "Search" }).click();
  const box = page.getByRole("searchbox", { name: /Search destinations/ });
  await box.fill("Lagos");
  await page.getByRole("button", { name: "Search", exact: true }).last().click();
  await expect(page).toHaveURL(/\/cities\/lagos/);
});

test("the experience page keeps its own booking bar, without the tab bar over it", async ({ page }) => {
  await mockApi(page, { "GET /experiences/exp-1": (r) => r.fulfill({ json: { id: "exp-1", title: "Makoko Boat Tour", city: "Lagos", currency: "NGN", images: [] } }) });
  await page.goto("/experiences/exp-1");

  await expect(page.getByRole("heading", { name: "Makoko Boat Tour" }).first()).toBeVisible();
  await expect(tabBar(page)).toHaveCount(0);
});

test("a signed-in traveller finds Wishlists in the menu, and notifications fit the screen", async ({ page }) => {
  await signIn(page);
  await mockApi(page, { "GET /auth/me": (r) => r.fulfill({ json: { id: "user-1", email: "ngozi@example.com" } }) });
  await page.goto("/");

  await page.getByRole("button", { name: "Profile menu" }).click();
  await expect(page.getByRole("link", { name: "Wishlists" }).first()).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Notifications" }).click();
  const panel = page.getByRole("heading", { name: "Notifications" }).locator("xpath=ancestor::div[contains(@class,'rounded-[24px]')][1]");
  const box = await panel.boundingBox();
  const width = page.viewportSize()!.width;
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(width);
});

test("Discover locations on a category page opens search", async ({ page }) => {
  await mockApi(page, {
    "GET /experiences/filter": (r) => r.fulfill({ json: { items: [], total: 0, page: 1, limit: 16, total_pages: 0 } }),
  });
  await page.goto("/categories/culture-history");

  await page.getByRole("button", { name: "Discover locations" }).click();
  await expect(page.getByRole("searchbox", { name: /Search destinations/ })).toBeVisible();
});
