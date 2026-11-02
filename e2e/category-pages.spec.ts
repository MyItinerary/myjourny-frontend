import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

const CATEGORIES = [
  {
    id: 17,
    parent_id: null,
    slug: "local-food-drinks",
    text: "Local food & drinks",
    category_type: "interest",
    is_active: true,
    children: [
      { id: 24, parent_id: 17, slug: "street-food-markets", text: "Street food & markets", category_type: "interest", is_active: true },
    ],
  },
];

const SUYA = {
  id: "exp-suya",
  title: "Abuja Night Market & Suya Safari",
  city: "Abuja",
  country: "Nigeria",
  duration_minutes: 150,
  rating: 4.6,
  currency: "NGN",
  price_from: 12000,
};

const page1 = (items: unknown[]) => ({ items, total: items.length, page: 1, limit: 16, total_pages: 1 });

async function openCategory(page: Page, slug: string) {
  const filterCalls: URLSearchParams[] = [];
  let recommendationCalls = 0;
  await mockApi(page, {
    "GET /categories": (r: Route) => r.fulfill({ json: CATEGORIES }),
    "GET /experiences/filter": (r: Route) => {
      const params = new URL(r.request().url()).searchParams;
      filterCalls.push(params);
      return r.fulfill({ json: page1(params.get("interest") === slug ? [SUYA] : []) });
    },
    "GET /experiences/recommendations": (r: Route) => {
      recommendationCalls += 1;
      return r.fulfill({ json: [] });
    },
  });
  await page.goto(`/categories/${slug}`);
  return { filterCalls, recommendationCalls: () => recommendationCalls };
}

test("a guest sees a subcategory's experiences, with its own title", async ({ page }) => {
  const api = await openCategory(page, "street-food-markets");

  // The subcategory's own name, from GET /categories, not the slug.
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByText("Street food & markets")).toBeVisible();
  await expect(page.getByText(SUYA.title).first()).toBeVisible();
  expect(api.filterCalls.some((p) => p.get("interest") === "street-food-markets")).toBe(true);
});

test("a signed-in traveller gets the same filtered results, not unfiltered recommendations", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "chidinma@example.com", fullName: "Chidinma Eze", avatarUrl: null },
      }),
    );
  });
  const api = await openCategory(page, "local-food-drinks");

  await expect(page.getByText(SUYA.title).first()).toBeVisible();
  expect(api.filterCalls.some((p) => p.get("interest") === "local-food-drinks")).toBe(true);
  expect(api.recommendationCalls()).toBe(0);
});
