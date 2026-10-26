import { devices, type Page, type Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

// A phone. Pixel rather than iPhone: an iPhone preset switches the browser to
// WebKit, which a spec can't do.
const pixel: Record<string, unknown> = { ...devices["Pixel 7"] };
delete pixel.defaultBrowserType;
test.use(pixel);

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
const CARD = { id: "exp-1", title: "Lagos Food Walk", city: "Lagos", currency: "NGN", price_from: 5000, duration_minutes: 180 };
const page1 = (items: unknown[]) => ({ items, total: items.length, page: 1, limit: 16, total_pages: 1 });

async function stubApi(page: Page) {
  await mockApi(page, {
    "GET /experiences/filter": (r: Route) => r.fulfill({ json: page1([CARD, { ...CARD, id: "exp-2" }]) }),
    "GET /experiences/cities": (r: Route) =>
      r.fulfill({ json: [{ slug: "lagos", name: "Lagos", country: "Nigeria", count: 25, image_url: null }] }),
    "GET /experiences/exp-1": (r: Route) => r.fulfill({ json: EXPERIENCE }),
    "GET /experiences/exp-1/pricing": (r: Route) =>
      r.fulfill({
        json: {
          currency: "NGN",
          prices: [{ id: "adult", label: "Adult", amount: "5000", pricing_unit: "per_person" }],
          addons: [],
          rules: [],
        },
      }),
    "GET /experiences/exp-1/sessions": (r: Route) =>
      r.fulfill({
        json: {
          timezone: "Africa/Lagos",
          scheduled: true,
          sessions: [{ starts_at: `${SESSION_DAY}T08:00:00Z`, local_date: SESSION_DAY, local_time: "09:00:00", seats_left: 8, sold_out: false }],
        },
      }),
  });
}

// Anything visible that sticks out past the screen's right edge, ignoring
// rows meant to scroll sideways (carousels, chip rows). The page clips
// sideways overflow, so this would otherwise be invisible.
async function overflowing(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const width = window.innerWidth;
    const scrollsSideways = (el: Element | null): boolean => {
      for (let node = el?.parentElement; node && node !== document.body; node = node.parentElement) {
        const x = getComputedStyle(node).overflowX;
        if (x === "auto" || x === "scroll" || x === "hidden" || x === "clip") return true;
      }
      return false;
    };
    const out: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (getComputedStyle(el).position === "fixed") continue;
      if (box.right > width + 1 && !scrollsSideways(el)) {
        out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(box.right)}`);
      }
    }
    return out.slice(0, 5);
  });
}

for (const path of ["/", "/categories/culture-history", "/cities/lagos", "/popular-experiences", "/search?q=lagos", "/experiences/exp-1"]) {
  test(`nothing runs off a phone screen on ${path}`, async ({ page }) => {
    await stubApi(page);
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    expect(await overflowing(page)).toEqual([]);
  });
}

test("the booking sheet fits the phone and its guest buttons are easy to tap", async ({ page }) => {
  await stubApi(page);
  await page.goto("/experiences/exp-1");

  await page.getByRole("button", { name: "Book now" }).last().click();
  const plus = page.getByRole("button", { name: "Increase guests" }).last();
  const box = await plus.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(40);
  expect(box!.height).toBeGreaterThanOrEqual(40);
  expect(await overflowing(page)).toEqual([]);
});

test("Share copies the experience link when there's no share sheet", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  });
  await stubApi(page);
  await page.goto("/experiences/exp-1");

  await page.getByRole("button", { name: "Share" }).first().click();
  await expect(page.getByText("Link copied")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("/experiences/exp-1");
});
