import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

const accra = { name: "Accra", region: "Greater Accra Region", country: "Ghana", country_code: "GH", latitude: 5.6037, longitude: -0.187 };
const nairobi = { name: "Nairobi", region: "Nairobi County", country: "Kenya", country_code: "KE", latitude: -1.2864, longitude: 36.8172 };

/** Opens Personal information for a profile with no city. `saved` collects
 * what is sent to PUT /profile/me, and the profile reflects it afterwards. */
async function openPersonalInfo(page: Page, overrides: Record<string, (route: Route) => unknown> = {}) {
  const saved: { city?: string }[] = [];
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "kwame@example.com", fullName: "Kwame Mensah", avatarUrl: null },
      }),
    );
  });
  await mockApi(page, {
    "GET /auth/me": (r) => r.fulfill({ json: { id: "user-1", email: "kwame@example.com" } }),
    "GET /profile/me": (r) =>
      r.fulfill({ json: { full_name: "Kwame Mensah", city: saved.at(-1)?.city ?? null } }),
    "PUT /profile/me": (r) => {
      saved.push(r.request().postDataJSON());
      return r.fulfill({ json: { message: "Profile updated successfully" } });
    },
    ...overrides,
  });
  await page.goto("/profile?tab=personal");
  await expect(page.getByText("Emergency contact")).toBeVisible();
  return saved;
}

const cityRow = (page: Page) => page.getByText("City", { exact: true }).locator("..");

test.describe("profile city", () => {
  test("fills an empty city from a location the browser already shares", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 5.6037, longitude: -0.187 });

    const saved = await openPersonalInfo(page, {
      "GET /geo/reverse": (r) => r.fulfill({ json: accra }),
    });

    await expect(page.getByText("We set your city to Accra from your location. Use Edit to change it.")).toBeVisible();
    await expect(cityRow(page)).toContainText("Accra");
    expect(saved).toEqual([{ city: "Accra" }]);
  });

  test("without shared location it stays empty, and any city can be searched for", async ({ page }) => {
    let reverses = 0;
    const saved = await openPersonalInfo(page, {
      "GET /geo/reverse": (r) => {
        reverses += 1;
        return r.fulfill({ json: accra });
      },
      "GET /geo/cities": (r) => r.fulfill({ json: new URL(r.request().url()).searchParams.get("q") === "nai" ? [nairobi] : [] }),
    });

    await expect(cityRow(page)).toContainText("Not provided");
    expect(reverses).toBe(0);

    await cityRow(page).locator("..").getByRole("button", { name: "Edit" }).click();
    await expect(page.getByText("Popular cities")).toBeVisible();
    await page.getByRole("textbox", { name: "Search for a city" }).fill("nai");
    await page.getByRole("button", { name: /Nairobi/ }).click();
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Saved. Your city is Nairobi.")).toBeVisible();
    await expect(cityRow(page)).toContainText("Nairobi");
    expect(saved).toEqual([{ city: "Nairobi" }]);
  });

  test("Use my location explains a blocked location and leaves search working", async ({ page }) => {
    await openPersonalInfo(page);
    await cityRow(page).locator("..").getByRole("button", { name: "Edit" }).click();

    await page.getByRole("button", { name: "Use my location" }).click();

    await expect(page.getByText("Location is blocked for this site. Search for your city instead.")).toBeVisible();
    await page.getByRole("button", { name: /Abuja/ }).click();
    await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
  });
});
