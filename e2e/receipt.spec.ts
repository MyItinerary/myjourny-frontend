import { expect, mockApi, test } from "./fixtures";

test("confirmed receipt renders paid badge, pricing, and order details", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "traveller@example.com", fullName: "Ireti George" },
      })
    );
  });

  await mockApi(page, {
    "GET /bookings/b-receipt-1": (r) =>
      r.fulfill({
        status: 200,
        json: {
          id: "b-receipt-1",
          order_number: "MJ-48213",
          user_id: "user-1",
          paystack_reference: "MJPAY-7F3A91C2",
          experience_title: "Sunrise Kayaking at Tarkwa Bay",
          status: "confirmed",
          payment_status: "paid",
          party_size: 1,
          price_total: "24000.00",
          currency: "NGN",
          created_at: "2026-10-21T14:32:00",
          requested_datetime: "2026-11-14T09:00:00",
          user_full_name: "Ireti George",
          receipt_url: "https://api.example.com/receipt.pdf",
        },
      }),
  });

  await page.goto("/receipts/b-receipt-1");

  await expect(page.getByRole("heading", { name: "Receipt" })).toBeVisible();
  await expect(page.getByText("Paid", { exact: true })).toBeVisible();
  await expect(page.getByText("Sunrise Kayaking at Tarkwa Bay")).toBeVisible();
  await expect(page.getByText("MJ-48213")).toBeVisible();
  await expect(page.getByText("MJPAY-7F3A91C2")).toBeVisible();
  await expect(page.getByText("Ireti George")).toBeVisible();
  await expect(page.getByRole("button", { name: /Download PDF/i })).toBeVisible();
});

test("shows sign-in prompt when unauthenticated (401)", async ({ page }) => {
  await mockApi(page, {
    "GET /bookings/b-secret": (r) =>
      r.fulfill({ status: 401, json: { detail: "Unauthorized" } }),
  });

  await page.goto("/receipts/b-secret");

  await expect(page.getByText("Sign in to view receipt")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("shows not found message on 404", async ({ page }) => {
  await mockApi(page, {
    "GET /bookings/b-non-existent": (r) =>
      r.fulfill({ status: 404, json: { detail: "Not found" } }),
  });

  await page.goto("/receipts/b-non-existent");

  await expect(page.getByText("Receipt not found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});
