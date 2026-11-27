import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

async function openPayoutSettings(page: Page, handlers: Record<string, (route: Route) => unknown>) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "guide-1", email: "host@example.com", fullName: "Ada Okafor", avatarUrl: null },
      }),
    );
  });
  await mockApi(page, {
    "GET /auth/me": (route) => route.fulfill({ json: { id: "guide-1", email: "host@example.com", full_name: "Ada Okafor", signup_type: "guide", guide_status: "approved" } }),
    "GET /guide/payout-account": (route) => route.fulfill({ json: { connected: false, provider: null, onboarding_completed: false } }),
    "GET /payment/paystack/banks": (route) => route.fulfill({ json: { country: "nigeria", currency: "NGN", banks: [{ name: "Example Bank", code: "000" }] } }),
    "GET /guide/payouts": (route) => route.fulfill({ json: [] }),
    ...handlers,
  });
  await page.goto("/host/dashboard/profile?pane=payouts");
}

test.describe("guide payout settings", () => {
  test("verifies and saves a Paystack bank account only after name confirmation", async ({ page }) => {
    let recipientBody: unknown;
    let saved = false;
    await openPayoutSettings(page, {
      "GET /payment/paystack/bank/resolve": (route) => route.fulfill({ json: { account_number: "0123456789", account_name: "Ada Okafor", bank_id: 1 } }),
      "POST /payment/paystack-recipient": async (route) => {
        recipientBody = route.request().postDataJSON();
        saved = true;
        return route.fulfill({ json: { status: "success", recipient_code: "RCP_123" } });
      },
      "GET /guide/payout-account": (route) =>
        route.fulfill({ json: saved ? { connected: true, provider: "paystack", onboarding_completed: true } : { connected: false, provider: null, onboarding_completed: false } }),
    });

    await expect(page.getByRole("heading", { name: "Payouts" })).toBeVisible();
    await page.getByLabel("Bank").selectOption("000");
    await page.getByLabel("Account number").fill("0123456789");
    await page.getByRole("button", { name: "Verify account" }).click();
    await expect(page.getByText(/Verified account name: Ada Okafor/)).toBeVisible();
    const save = page.getByRole("button", { name: "Save bank account" });
    await expect(save).toBeDisabled();
    await page.getByRole("checkbox", { name: "I confirm this is the account I want payouts sent to." }).check();
    await save.click();

    await expect(page.getByText("Paystack account connected")).toBeVisible();
    expect(recipientBody).toEqual({
      name: "Ada Okafor", account_number: "0123456789", bank_code: "000", currency: "NGN", target_id: "guide-1", account_type: "guide",
    });
  });

  test("creates guide Stripe onboarding and navigates to the returned URL", async ({ page }) => {
    let connectBody: unknown;
    await openPayoutSettings(page, {
      "POST /payment/connect-account": async (route) => {
        connectBody = route.request().postDataJSON();
        return route.fulfill({ json: { account_url: "https://connect.stripe.com/onboarding/test" } });
      },
    });
    await page.route("https://connect.stripe.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "Stripe test page" }));

    await page.getByRole("button", { name: "Connect Stripe" }).click();
    await expect(page).toHaveURL("https://connect.stripe.com/onboarding/test");
    expect(connectBody).toEqual({ account_type: "guide", target_id: "guide-1" });
  });
});
