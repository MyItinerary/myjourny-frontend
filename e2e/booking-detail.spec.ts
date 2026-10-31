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

const SIGNED_IN = () => {
  window.localStorage.setItem(
    "myjourny:auth",
    JSON.stringify({
      accessToken: "e2e-access",
      refreshToken: "e2e-refresh",
      user: { id: "user-1", email: "traveller@example.com", fullName: "Traveller", avatarUrl: null },
    }),
  );
};

test("a confirmed booking shows where to meet, what to bring and the downloads", async ({ page }) => {
  await page.addInitScript(SIGNED_IN);
  await mockApi(page, {
    "GET /bookings/b-2": (r) =>
      r.fulfill({
        json: {
          id: "b-2",
          user_id: "user-1",
          guide_id: "guide-1",
          experience_id: "exp-2",
          status: "confirmed",
          payment_status: "paid",
          payout_status: "pending",
          requested_datetime: "2030-06-01T08:00:00",
          session_timezone: "Africa/Lagos",
          party_size: 2,
          price_total: "15000.00",
          currency: "NGN",
          line_items: [],
          meeting_point: {
            latitude: 6.4281,
            longitude: 3.4219,
            instructions: "Lekki Phase 1 jetty, by the blue kiosk",
            city: "Lagos",
            country: "Nigeria",
          },
          what_to_bring: "Swimwear and sunscreen",
          host_phone: "+2348030000000",
          receipt_url: "https://api.example.com/bookings/b-2/receipt.pdf?token=r",
          calendar_url: "https://api.example.com/bookings/b-2/calendar.ics?token=c",
          created_at: "2030-05-01T10:00:00",
          updated_at: "2030-05-01T10:00:00",
        },
      }),
    "GET /bookings/b-2/cancellation": (r) => r.fulfill({ json: null }),
    "GET /experiences/exp-2": (r) => r.fulfill({ json: { id: "exp-2", title: "Sunset Paddle at Lekki", status: "ACTIVE" } }),
  });

  await page.goto("/bookings/b-2");

  await expect(page.getByRole("heading", { name: "On the day" })).toBeVisible();
  await expect(page.getByText("Lekki Phase 1 jetty, by the blue kiosk")).toBeVisible();
  await expect(page.getByText("Swimwear and sunscreen")).toBeVisible();
  await expect(page.getByRole("link", { name: "+2348030000000" })).toHaveAttribute("href", "tel:+2348030000000");
  await expect(page.getByRole("link", { name: "Get directions" })).toHaveAttribute(
    "href",
    "https://www.google.com/maps/dir/?api=1&destination=6.4281,3.4219",
  );
  await expect(page.getByRole("link", { name: "Add to calendar" })).toHaveAttribute(
    "href",
    "https://api.example.com/bookings/b-2/calendar.ics?token=c",
  );
  await expect(page.getByRole("link", { name: "Download receipt" })).toHaveAttribute(
    "href",
    "https://api.example.com/bookings/b-2/receipt.pdf?token=r",
  );
});

test("a signed-out visitor is sent to log in and brought back to the booking", async ({ page }) => {
  await mockApi(page);

  await page.goto("/bookings/b-3");

  await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login?next=%2Fbookings%2Fb-3");
});
