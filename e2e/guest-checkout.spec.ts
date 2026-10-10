import { expect, mockApi, test } from "./fixtures";

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const SESSION_DAY = inDays(5);

const EXPERIENCE = {
  id: "exp-1",
  guide_id: "guide-1",
  status: "ACTIVE",
  title: "Lagos Food Walk",
  city: "Lagos",
  country: "Nigeria",
  currency: "NGN",
  duration_minutes: 150,
  group_size_min: 1,
  group_size_max: 10,
  images: [],
  host: { id: "guide-1", display_name: "Kayan Thrille" },
};

const QUOTE = {
  currency: "NGN",
  lines: [{ kind: "ticket", label: "Adult", quantity: 1, unit_amount: "16000", amount: "16000" }],
  subtotal: "16000",
  discount: "0",
  checkout_fee: "0",
  total: "16000",
  guests: 1,
  days: 1,
  promo_applied: false,
};

test("a guest books from the experience page: email, details, then the payment page", async ({ page }) => {
  let bookingBody: Record<string, unknown> | null = null;
  await page.route("https://paystack.test/**", (route) => route.fulfill({ contentType: "text/html", body: "<h1>Paystack</h1>" }));
  await mockApi(page, {
    "GET /experiences/exp-1": (r) => r.fulfill({ json: EXPERIENCE }),
    "GET /experiences/exp-1/pricing": (r) =>
      r.fulfill({
        json: {
          currency: "NGN",
          prices: [{ id: "adult", label: "Adult", amount: "16000", pricing_unit: "per_person" }],
          addons: [],
          rules: [],
        },
      }),
    "GET /experiences/exp-1/sessions": (r) =>
      r.fulfill({
        json: {
          timezone: "Africa/Lagos",
          scheduled: true,
          sessions: [{ starts_at: `${SESSION_DAY}T08:00:00Z`, local_date: SESSION_DAY, local_time: "09:00:00", seats_left: 8, sold_out: false }],
        },
      }),
    // Priced once there's an account; a guest has none yet.
    "POST /bookings/quote": (r) =>
      r.request().headers().authorization
        ? r.fulfill({ json: QUOTE })
        : r.fulfill({ status: 401, json: { detail: "Not authenticated" } }),
    "POST /auth/temp": (r) => r.fulfill({ json: { access_token: "temp-access", refresh_token: "temp-refresh", user_id: "temp-1" } }),
    "POST /auth/activate": (r) =>
      r.fulfill({ json: { id: "temp-1", email: "juliet@example.com", full_name: null, avatar_url: null } }),
    "POST /bookings": async (r) => {
      bookingBody = r.request().postDataJSON();
      await r.fulfill({ json: { id: "b-1", status: "pending", payment_status: "unpaid", url: "https://paystack.test/pay" } });
    },
  });

  await page.goto("/experiences/exp-1");
  await page.locator("div.sticky").getByRole("button", { name: /Book now/ }).click();

  // Step 1: the email.
  await expect(page).toHaveURL(/\/checkout$/);
  const confirm = page.getByRole("button", { name: "Continue", exact: true });
  await expect(confirm).toBeDisabled();
  await page.getByLabel("Email address").fill("juliet@example.com");
  await confirm.click();

  // Step 2: phone and a note, then pay.
  await expect(page.getByRole("heading", { name: "Confirm your details and pay" })).toBeVisible();
  await expect(page.getByText("juliet@example.com")).toBeVisible();
  const pay = page.getByRole("button", { name: "Confirm and pay" });
  await expect(pay).toBeDisabled();
  await page.getByLabel("Phone number").fill("7016377711");
  await page.getByLabel("Leave a note for the guide").fill("Just bring me a wheelchair");
  await expect(pay).toBeEnabled();
  await pay.click();

  await expect(page).toHaveURL("https://paystack.test/pay");
  expect(bookingBody).toMatchObject({ experience_id: "exp-1", guide_id: "guide-1" });
});

test("checkout with nothing picked goes back home", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/$/);
});

test("after paying, the booking page says you're going", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "juliet@example.com", fullName: null, avatarUrl: null },
      }),
    );
  });
  await mockApi(page, {
    "GET /bookings/b-1": (r) =>
      r.fulfill({
        json: {
          id: "b-1",
          experience_id: "exp-1",
          status: "confirmed",
          payment_status: "paid",
          requested_datetime: "2026-07-16T08:00:00",
          party_size: 1,
          price_total: "10000.00",
          currency: "NGN",
        },
      }),
    "GET /experiences/exp-1": (r) => r.fulfill({ json: EXPERIENCE }),
  });

  await page.goto("/bookings/b-1/success");

  await expect(page.getByRole("heading", { name: "You’re going!" })).toBeVisible();
  await expect(page.locator("a", { hasText: "View booking" })).toHaveAttribute("href", "/bookings/b-1");
  await expect(page.getByText("Lagos Food Walk").first()).toBeVisible();
});
