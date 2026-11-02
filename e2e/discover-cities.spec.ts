import { expect, mockApi, test } from "./fixtures";

const CITIES = [
  { slug: "lagos", name: "Lagos", country: "Nigeria", count: 25, image_url: null },
  { slug: "umuahia", name: "Umuahia", country: "Nigeria", count: 1, image_url: null },
];

test("Discover by cities lists the cities that have experiences, from the API", async ({ page }) => {
  await mockApi(page, { "GET /experiences/cities": (r) => r.fulfill({ json: CITIES }) });
  await page.goto("/");

  const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Discover by cities" }) });
  await expect(section.getByRole("link", { name: "Umuahia" })).toHaveAttribute("href", "/cities/umuahia");
  await expect(section.getByRole("link", { name: "Lagos" })).toBeVisible();
  // Cities from the old built-in list with no experiences are gone.
  await expect(section.getByRole("link", { name: "Jos" })).toHaveCount(0);
});
