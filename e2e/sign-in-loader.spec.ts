import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

const TOKENS = { access_token: "e2e-access", refresh_token: "e2e-refresh", token_type: "bearer" };
const ME = { id: "user-1", email: "amara@example.com", full_name: "Amara Okafor", avatar_url: null, completed: true };

// Answers after a pause, so the loader is on screen long enough to check.
const slowly = (respond: (route: Route) => Promise<void>) => async (route: Route) => {
  await new Promise((resolve) => setTimeout(resolve, 1_500));
  await respond(route);
};

async function logIn(page: Page, path = "/login") {
  await page.goto(path);
  const submit = page.getByRole("button", { name: "Continue", exact: true });
  // The inputs can be filled before React hydrates; re-fill until it reacts.
  await expect(async () => {
    await page.getByPlaceholder("Enter email address").fill("amara@example.com");
    await page.getByPlaceholder("Enter password").fill("correct-horse-battery");
    await expect(submit).toBeEnabled({ timeout: 1_000 });
  }).toPass();
  await submit.click();
}

test.describe("signing in", () => {
  // The loader covers the wait after the details are accepted (loading the account, opening the page).
  test("covers the screen with the pulsing logo, then opens the home page", async ({ page }) => {
    await mockApi(page, {
      "POST /auth/login": (r) => r.fulfill({ json: TOKENS }),
      "GET /auth/me": slowly((r) => r.fulfill({ json: ME })),
    });

    await logIn(page);

    const loader = page.getByTestId("sign-in-loader");
    await expect(loader).toBeVisible();
    await expect(loader.getByAltText("MyJourny")).toBeVisible();
    await expect(loader).toHaveCSS("background-color", "rgb(255, 255, 255)");

    await expect(page).toHaveURL(/\/$/);
    await expect(loader).toBeHidden();
  });

  test("goes where the sign-in was headed", async ({ page }) => {
    await mockApi(page, {
      "POST /auth/login": (r) => r.fulfill({ json: TOKENS }),
      "GET /auth/me": slowly((r) => r.fulfill({ json: ME })),
    });

    await logIn(page, `/login?next=${encodeURIComponent("/experiences")}`);

    await expect(page.getByTestId("sign-in-loader")).toBeVisible();
    await expect(page).toHaveURL(/\/experiences$/);
    await expect(page.getByTestId("sign-in-loader")).toBeHidden();
  });

  test("asks for a two-factor code without the loader", async ({ page }) => {
    await mockApi(page, {
      "POST /auth/login": slowly((r) => r.fulfill({ json: { "2fa_required": true } })),
    });

    await logIn(page);

    await expect(page.getByRole("button", { name: "Signing in…" })).toBeVisible();
    await expect(page.getByTestId("sign-in-loader")).toBeHidden();
    await expect(page.getByLabel("Two-factor code")).toBeVisible();
    await expect(page.getByTestId("sign-in-loader")).toBeHidden();
  });

  test("shows the error straight away when the details are wrong, with no loader", async ({ page }) => {
    await mockApi(page, {
      "POST /auth/login": slowly((r) => r.fulfill({ status: 400, json: { detail: "Incorrect email or password" } })),
    });

    await logIn(page);

    // While the details are checked only the button says so.
    await expect(page.getByRole("button", { name: "Signing in…" })).toBeVisible();
    await expect(page.getByTestId("sign-in-loader")).toBeHidden();
    await expect(page.getByText("Incorrect email or password")).toBeVisible();
    await expect(page.getByTestId("sign-in-loader")).toBeHidden();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByPlaceholder("Enter email address")).toBeVisible();
  });
});
