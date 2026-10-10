import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

const none = { upcoming_bookings: 0, open_refund_requests: 0, hosted_upcoming_bookings: 0, pending_payouts: 0 };

async function openDeleteDialog(page: Page, overrides: Record<string, (route: Route) => unknown>) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "traveller@example.com", fullName: "Traveller", avatarUrl: null },
      }),
    );
  });
  await mockApi(page, {
    "GET /auth/me": (r) => r.fulfill({ json: { id: "user-1", email: "traveller@example.com" } }),
    "GET /auth/2fa/status": (r) => r.fulfill({ json: { enabled: false } }),
    ...overrides,
  });
  await page.goto("/profile?tab=security");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("Step 1 of 2")).toBeVisible();
}

test.describe("account deletion", () => {
  test("is blocked until upcoming bookings and refunds are settled", async ({ page }) => {
    let deletes = 0;
    await openDeleteDialog(page, {
      "GET /auth/me/deletion-preview": (r) =>
        r.fulfill({
          json: {
            upcoming_booking_count: 1,
            review_count: 0,
            can_delete: false,
            blockers: { ...none, upcoming_bookings: 1, open_refund_requests: 1 },
          },
        }),
      "DELETE /auth/me": (r) => {
        deletes += 1;
        return r.fulfill({ status: 204 });
      },
    });

    await expect(page.getByText("You have an upcoming booking")).toBeVisible();
    await expect(page.getByText("A refund is still being reviewed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue to delete" })).toBeDisabled();
    expect(deletes).toBe(0);
  });

  test("says records are kept, then deletes after typing DELETE", async ({ page }) => {
    let deletes = 0;
    await openDeleteDialog(page, {
      "GET /auth/me/deletion-preview": (r) =>
        r.fulfill({ json: { upcoming_booking_count: 0, review_count: 0, can_delete: true, blockers: none } }),
      "DELETE /auth/me": (r) => {
        deletes += 1;
        return r.fulfill({ status: 204 });
      },
    });

    await expect(page.getByText("What we keep")).toBeVisible();
    await expect(page.getByText(/Booking and payment records, without your name or contact details/)).toBeVisible();
    await page.getByRole("button", { name: "Continue to delete" }).click();

    const confirm = page.getByRole("button", { name: "Delete my account" });
    await expect(confirm).toBeDisabled();
    await page.getByRole("textbox").fill("delete");
    await confirm.click();

    await expect.poll(() => deletes).toBe(1);
    // Signed out and sent home.
    await page.waitForURL((url) => url.pathname === "/");
  });

  test("shows the server's blockers if it refuses at the last step", async ({ page }) => {
    await openDeleteDialog(page, {
      "GET /auth/me/deletion-preview": (r) =>
        r.fulfill({ json: { upcoming_booking_count: 0, review_count: 0, can_delete: true, blockers: none } }),
      "DELETE /auth/me": (r) =>
        r.fulfill({
          status: 409,
          json: { detail: "Before deleting your account…", blockers: { ...none, hosted_upcoming_bookings: 2 } },
        }),
    });

    await page.getByRole("button", { name: "Continue to delete" }).click();
    await page.getByRole("textbox").fill("DELETE");
    await page.getByRole("button", { name: "Delete my account" }).click();

    await expect(page.getByText("Your experiences still have bookings or payouts to settle")).toBeVisible();
    await expect(page.getByText(/Contact support/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue to delete" })).toBeDisabled();
  });
});
