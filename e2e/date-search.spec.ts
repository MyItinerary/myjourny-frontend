import type { Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

const page1 = (items: unknown[]) => ({ items, total: items.length, page: 1, limit: 16, total_pages: 1 });
const KAYAK = { id: "exp-kayak", title: "Jabi Lake Kayak & Sunset Boat Cruise", city: "Abuja", currency: "NGN", price_from: 15000 };

test("a city page searched for a day asks only for experiences on that day", async ({ page }) => {
  const dates: (string | null)[] = [];
  await mockApi(page, {
    "GET /experiences/filter": (r: Route) => {
      const params = new URL(r.request().url()).searchParams;
      if (params.get("city")) dates.push(params.get("date"));
      return r.fulfill({ json: page1(params.get("city") ? [KAYAK] : []) });
    },
  });
  await page.goto("/cities/abuja?date=2030-06-01");

  await expect(page.getByText(KAYAK.title).first()).toBeVisible();
  expect(dates).toContain("2030-06-01");
});

test("a day the API refuses shows its reason instead of an empty page", async ({ page }) => {
  await mockApi(page, {
    "GET /experiences/filter": (r: Route) => {
      const params = new URL(r.request().url()).searchParams;
      return params.get("date")
        ? r.fulfill({ status: 400, json: { detail: "Pick today or a later date." } })
        : r.fulfill({ json: page1([]) });
    },
  });
  await page.goto("/categories/culture-history?date=2020-01-01");

  await expect(page.getByText("Pick today or a later date.")).toBeVisible({ timeout: 15000 });
});
