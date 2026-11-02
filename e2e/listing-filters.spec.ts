import { devices, type Page, type Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

const page1 = (items: unknown[]) => ({ items, total: items.length, page: 1, limit: 16, total_pages: 1 });
const CHEAP = { id: "exp-cheap", title: "Ibadan Night Market & Amala Street Food Tour", city: "Ibadan", currency: "NGN", price_from: 4000 };
const DEAR = { id: "exp-dear", title: "Obudu Mountain Resort Cable Car & Plateau Trek", city: "Calabar", currency: "NGN", price_from: 60000 };

async function openCategory(page: Page) {
  const calls: URLSearchParams[] = [];
  await mockApi(page, {
    "GET /experiences/filter": (r: Route) => {
      const params = new URL(r.request().url()).searchParams;
      if (params.get("interest")) calls.push(params);
      const max = params.get("price_max");
      return r.fulfill({ json: page1(params.get("interest") ? (max ? [CHEAP] : [CHEAP, DEAR]) : []) });
    },
  });
  await page.goto("/categories/local-food-drinks");
  await expect(page.getByText(DEAR.title).first()).toBeVisible();
  return calls;
}

test("a price filter narrows a category page", async ({ page }) => {
  const calls = await openCategory(page);

  await page.getByRole("button", { name: "More filters" }).click();
  const panel = page.getByRole("dialog", { name: "Filters" });
  await panel.getByRole("button", { name: "Under ₦5,000" }).click();
  await panel.getByRole("button", { name: /^Show / }).click();

  await expect(page.getByText(DEAR.title)).toHaveCount(0);
  await expect(page.getByText(CHEAP.title).first()).toBeVisible();
  expect(calls.at(-1)?.get("price_max")).toBe("5000");
});

test("a time of day asks for what listings store", async ({ page }) => {
  const calls = await openCategory(page);

  await page.getByRole("button", { name: "More filters" }).click();
  await page.getByRole("dialog", { name: "Filters" }).getByRole("button", { name: "Evening" }).click();

  await expect.poll(() => calls.at(-1)?.get("time_of_day")).toBe("night");
});

test.describe("on a phone", () => {
  const pixel: Record<string, unknown> = { ...devices["Pixel 7"] };
  delete pixel.defaultBrowserType;
  test.use(pixel);

  test("the Dates picker opens as a sheet at the bottom of the screen", async ({ page }) => {
    await openCategory(page);

    await page.getByRole("button", { name: "Dates" }).click();
    const sheet = page.getByRole("dialog", { name: "Dates" });
    await expect(sheet).toBeVisible();
    const box = await sheet.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(Math.round(box!.y + box!.height)).toBeGreaterThanOrEqual(viewport.height - 2);
    expect(box!.width).toBeGreaterThanOrEqual(viewport.width - 2);
  });
});
