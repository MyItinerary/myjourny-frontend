import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

async function openLoginAndSecurity(page: Page, overrides: Record<string, (route: Route) => unknown> = {}) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "amara@example.com", fullName: "Amara Okafor", avatarUrl: null },
      }),
    );
  });
  await mockApi(page, {
    "GET /auth/me": (r) => r.fulfill({ json: { id: "user-1", email: "amara@example.com" } }),
    "GET /auth/2fa/status": (r) => r.fulfill({ json: { enabled: false } }),
    ...overrides,
  });
  await page.goto("/profile?tab=security");
  await expect(page.getByText("Two factor authentication", { exact: true })).toBeVisible();
}

async function fillPasswords(page: Page, current: string, next: string, confirm: string) {
  await page.getByLabel("Current password").fill(current);
  await page.getByLabel("New password", { exact: true }).fill(next);
  await page.getByLabel("Confirm new password").fill(confirm);
}

test.describe("change password", () => {
  test("says which field is wrong before anything is sent", async ({ page }) => {
    let requests = 0;
    await openLoginAndSecurity(page, {
      "POST /auth/password/change": (r) => {
        requests += 1;
        return r.fulfill({ json: { message: "Password updated successfully" } });
      },
    });
    await page.getByRole("button", { name: "Edit" }).first().click();

    await fillPasswords(page, "OldPassword123!", "short", "shorter");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Use at least 10 characters.")).toBeVisible();
    await expect(page.getByText("The passwords don't match.")).toBeVisible();
    expect(requests).toBe(0);
  });

  test("shows a wrong current password under that field, then saves once it is right", async ({ page }) => {
    await openLoginAndSecurity(page, {
      "POST /auth/password/change": (r) => {
        const body = r.request().postDataJSON() as { current_password: string };
        return body.current_password === "OldPassword123!"
          ? r.fulfill({ json: { message: "Password updated successfully" } })
          : r.fulfill({ status: 400, json: { detail: "Incorrect current password" } });
      },
    });
    await page.getByRole("button", { name: "Edit" }).first().click();

    await fillPasswords(page, "NotMyPassword1!", "NewPassword123!", "NewPassword123!");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("That isn't your current password.")).toBeVisible();
    // Still open, with the new password kept.
    await expect(page.getByLabel("New password", { exact: true })).toHaveValue("NewPassword123!");

    await page.getByLabel("Current password").fill("OldPassword123!");
    await expect(page.getByText("That isn't your current password.")).toBeHidden();
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Password changed. Your other devices have been signed out.")).toBeVisible();
    await expect(page.getByLabel("Current password")).toBeHidden();
  });

  test("passwords are hidden until the eye button is pressed", async ({ page }) => {
    await openLoginAndSecurity(page);
    await page.getByRole("button", { name: "Edit" }).first().click();

    const current = page.getByLabel("Current password");
    await current.fill("OldPassword123!");
    await expect(current).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Show password" }).first().click();
    await expect(current).toHaveAttribute("type", "text");
    await expect(current).toHaveValue("OldPassword123!");

    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(current).toHaveAttribute("type", "password");
  });

  test("two factor setup says any authenticator app works", async ({ page }) => {
    await openLoginAndSecurity(page, {
      "POST /auth/2fa/setup": (r) =>
        r.fulfill({
          json: {
            secret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP",
            qr_payload: "otpauth://totp/MyJourny%3Aamara%40example.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=MyJourny",
            otpauth_url: "otpauth://totp/MyJourny%3Aamara%40example.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=MyJourny",
          },
        }),
    });

    await expect(page.getByText(/Works with any authenticator app/)).toBeVisible();
    await page.getByRole("button", { name: "Set up" }).click();
    await expect(page.getByText("Open any authenticator app and scan this code")).toBeVisible();
    await expect(page.getByText(/Any authenticator app works/)).toBeVisible();
  });
});
