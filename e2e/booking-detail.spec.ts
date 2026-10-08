import { expect, mockApi, test } from "./fixtures";

// A 3-day Lagos booking, viewed from a browser in Los Angeles: the dates and
// time shown are the session's (Lagos), not the browser's.
test.use({ timezoneId: "America/Los_Angeles" });

test("shows a multi-day booking's dates in the session's time zone", async ({ page }) => {
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
    "GET /bookings/b-1": (r) =>
      r.fulfill({
        json: {
          id: "b-1",
          user_id: "user-1",
          guide_id: "guide-1",
          experience_id: "exp-1",
          status: "confirmed",
          payment_status: "paid",
          payout_status: "pending",
          // 08:00 UTC is 9:00 AM in Lagos (and 1:00 AM in Los Angeles).
          requested_datetime: "2030-06-01T08:00:00",
          session_end_at: "2030-06-03T10:00:00",
          session_timezone: "Africa/Lagos",
          party_size: 2,
          price_total: "15000.00",
          currency: "NGN",
          line_items: [],
          created_at: "2030-05-01T10:00:00",
          updated_at: "2030-05-01T10:00:00",
        },
      }),
    "GET /bookings/b-1/cancellation": (r) => r.fulfill({ json: null }),
    "GET /experiences/exp-1": (r) => r.fulfill({ json: { id: "exp-1", title: "Lagos Food Walk", status: "ACTIVE" } }),
  });

  await page.goto("/bookings/b-1");

  await expect(page.getByText("Sat, June 1 at 9:00 AM – Mon, June 3")).toBeVisible();
});
