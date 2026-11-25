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
const searchSheet = (page: Page) => page.getByRole("dialog", { name: "Search" });

test("the home page's bottom bar reaches the main sections", async ({ page }) => {
  await page.goto("/");

  await expect(tabBar(page).getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  await expect(tabBar(page).getByRole("link", { name: "Experiences" })).toBeVisible();
  await expect(tabBar(page).getByRole("link", { name: "My wishlists" })).toHaveAttribute("href", "/wishlists");

  // It stays as you move between its tabs. Experiences has the hero's search, so no header search button.
  await tabBar(page).getByRole("link", { name: "Experiences" }).click();
  await expect(page).toHaveURL(/\/experiences$/);
  await expect(tabBar(page).getByRole("link", { name: "Experiences" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("banner").getByRole("button", { name: "Search", exact: true })).toHaveCount(0);
});

test("the hero search opens the search sheet, and a destination lands on its city page", async ({ page }) => {
  await page.goto("/");

  // The home page has the hero's search box, so the header has no search button there.
  await expect(page.getByRole("banner").getByRole("button", { name: "Search", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Search destinations or activities" }).click();
  await expect(searchSheet(page).getByRole("heading", { name: "Where to?" })).toBeVisible();

  await searchSheet(page).getByRole("searchbox", { name: "Search destination or activities" }).fill("Lagos");
  await searchSheet(page).getByRole("button", { name: /Lagos, Nigeria/ }).click();
  await expect(searchSheet(page).getByRole("heading", { name: "When?" })).toBeVisible();
  await searchSheet(page).getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/cities\/lagos/);
});

test("the experience page keeps its own booking bar, without the bottom bar over it", async ({ page }) => {
  await mockApi(page, { "GET /experiences/exp-1": (r) => r.fulfill({ json: { id: "exp-1", title: "Makoko Boat Tour", city: "Lagos", currency: "NGN", images: [] } }) });
  await page.goto("/experiences/exp-1");

  await expect(page.getByRole("heading", { name: "Makoko Boat Tour" }).first()).toBeVisible();
  await expect(tabBar(page)).toHaveCount(0);
});

test("a signed-in host gets the full-screen menu with Switch to hosting, and it fits the screen", async ({ page }) => {
  await signIn(page);
  await mockApi(page, {
    "GET /auth/me": (r) => r.fulfill({ json: { id: "user-1", email: "ngozi@example.com", signup_type: "guide" } }),
  });
  await page.goto("/");

  await page.getByRole("button", { name: "Profile menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu.getByRole("link", { name: "Switch to guiding" })).toHaveAttribute("href", "/host/dashboard");
  await expect(menu.getByText("Become a guide")).toHaveCount(0);
  const notifications = menu.getByRole("link", { name: "Notifications" });
  await expect(notifications).toBeVisible();
  const box = await notifications.boundingBox();
  const width = page.viewportSize()!.width;
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(width);
});

test("a signed-in traveller is invited to become a guide, with no Switch to hosting", async ({ page }) => {
  await signIn(page);
  await mockApi(page, {
    "GET /auth/me": (r) => r.fulfill({ json: { id: "user-1", email: "ngozi@example.com", signup_type: "traveller" } }),
  });
  await page.goto("/");

  await page.getByRole("button", { name: "Profile menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu.getByRole("link", { name: /Become a guide/ })).toHaveAttribute("href", "/become-a-guide");
  await expect(menu.getByRole("link", { name: "Switch to guiding" })).toHaveCount(0);
});

test("the search button in the header opens the search sheet on a category page", async ({ page }) => {
  await mockApi(page, {
    "GET /experiences/filter": (r) => r.fulfill({ json: { items: [], total: 0, page: 1, limit: 16, total_pages: 0 } }),
  });
  await page.goto("/categories/culture-history");

  await page.getByRole("banner").getByRole("button", { name: "Search", exact: true }).click();
  await expect(searchSheet(page).getByPlaceholder("Search destination or activities")).toBeVisible();
});
