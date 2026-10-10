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

test("a guest books from the experience page: details, password, then the payment page", async ({ page }) => {
  let bookingBody: Record<string, unknown> | null = null;
  let registerBody: Record<string, unknown> | null = null;
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
    "POST /auth/register": (r) => {
      registerBody = r.request().postDataJSON();
      return r.fulfill({ json: { access_token: "new-access", refresh_token: "new-refresh" } });
    },
    "GET /auth/me": (r) =>
      r.fulfill({ json: { id: "user-1", email: "juliet@example.com", full_name: null, avatar_url: null } }),
    "POST /bookings": async (r) => {
      bookingBody = r.request().postDataJSON();
      await r.fulfill({ json: { id: "b-1", status: "pending", payment_status: "unpaid", url: "https://paystack.test/pay" } });
    },
  });

  await page.goto("/experiences/exp-1");
  await page.locator("div.sticky").getByRole("button", { name: /Book now/ }).click();

  // Step 1: email and phone.
  await expect(page).toHaveURL(/\/checkout$/);
  const next = page.getByRole("button", { name: "Continue", exact: true });
  await expect(next).toBeDisabled();
  await page.getByPlaceholder("Enter email address").fill("juliet@example.com");
  await page.getByLabel("Phone number").fill("7016377711");
  await next.click();

  // Step 2: a password, then pay. The account is made as they confirm.
  const pay = page.getByRole("button", { name: "Confirm and pay" });
  await expect(pay).toBeDisabled();
  await page.getByPlaceholder("Enter password here", { exact: true }).fill("longenough1");
  await page.getByPlaceholder("Re enter password here").fill("longenough1");
  await expect(pay).toBeEnabled();
  await pay.click();

  await expect(page).toHaveURL("https://paystack.test/pay");
  expect(registerBody).toMatchObject({ email: "juliet@example.com", password: "longenough1", phone_number: "+2347016377711" });
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

test("a signed-in user skips checkout: Book now goes straight to the payment page", async ({ page }) => {
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
  await page.route("https://paystack.test/**", (route) => route.fulfill({ contentType: "text/html", body: "<h1>Paystack</h1>" }));
  let created = 0;
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
    "POST /bookings/quote": (r) => r.fulfill({ json: QUOTE }),
    "POST /bookings": async (r) => {
      created += 1;
      await r.fulfill({ json: { id: "b-1", status: "pending", payment_status: "unpaid", url: "https://paystack.test/pay" } });
    },
  });

  await page.goto("/experiences/exp-1");
  await page.locator("div.sticky").getByRole("button", { name: /Book now/ }).click();

  await expect(page).toHaveURL("https://paystack.test/pay");
  expect(created).toBe(1);
});

test("a guest whose email already has an account logs in and goes straight to payment", async ({ page }) => {
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
    "POST /bookings/quote": (r) =>
      r.request().headers().authorization
        ? r.fulfill({ json: QUOTE })
        : r.fulfill({ status: 401, json: { detail: "Not authenticated" } }),
    "POST /auth/email-exists": (r) => r.fulfill({ json: { exists: true } }),
    "POST /auth/login": (r) => r.fulfill({ json: { access_token: "login-access", refresh_token: "login-refresh" } }),
    "GET /auth/me": (r) =>
      r.fulfill({ json: { id: "user-1", email: "juliet@example.com", full_name: null, avatar_url: null } }),
    "POST /bookings": async (r) => {
      bookingBody = r.request().postDataJSON();
      await r.fulfill({ json: { id: "b-1", status: "pending", payment_status: "unpaid", url: "https://paystack.test/pay" } });
    },
  });

  await page.goto("/experiences/exp-1");
  await page.locator("div.sticky").getByRole("button", { name: /Book now/ }).click();
  await page.getByPlaceholder("Enter email address").fill("juliet@example.com");
  await page.getByLabel("Phone number").fill("7016377711");

  // The email has an account, so the first step offers to log in instead.
  await page.getByRole("button", { name: "Login and continue to book" }).click();
  await expect(page.getByText("Welcome back!")).toBeVisible();
  await page.getByPlaceholder("Enter password").fill("secret123");
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await expect(page).toHaveURL("https://paystack.test/pay");
  expect(bookingBody).toMatchObject({ experience_id: "exp-1", guide_id: "guide-1" });
});

test("resetting a password from the checkout leads back to it, with the booking and phone still there", async ({ page }) => {
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
    "POST /bookings/quote": (r) =>
      r.request().headers().authorization
        ? r.fulfill({ json: QUOTE })
        : r.fulfill({ status: 401, json: { detail: "Not authenticated" } }),
    "POST /auth/email-exists": (r) => r.fulfill({ json: { exists: true } }),
    "POST /auth/password/request-reset": (r) => r.fulfill({ json: { message: "ok" } }),
    "POST /auth/password/reset-with-token": (r) => r.fulfill({ json: { message: "ok" } }),
    "POST /auth/login": (r) => r.fulfill({ json: { access_token: "login-access", refresh_token: "login-refresh" } }),
    "GET /auth/me": (r) =>
      r.fulfill({ json: { id: "user-1", email: "juliet@example.com", full_name: null, avatar_url: null } }),
    "POST /bookings": async (r) => {
      bookingBody = r.request().postDataJSON();
      await r.fulfill({ json: { id: "b-1", status: "pending", payment_status: "unpaid", url: "https://paystack.test/pay" } });
    },
  });

  await page.goto("/experiences/exp-1");
  await page.locator("div.sticky").getByRole("button", { name: /Book now/ }).click();
  await page.getByPlaceholder("Enter email address").fill("juliet@example.com");
  await page.getByLabel("Phone number").fill("7016377711");
  await page.getByRole("button", { name: "Login and continue to book" }).click();
  await page.getByText("Forgot password?").click();
  await expect(page).toHaveURL(/\/login\/forgot-password$/);

  // The reset email's link would open a new tab with the same storage; the end
  // of the flow takes them back to the checkout via log-in.
  await page.goto("/login/forgot-password/success");
  await page.locator("a", { hasText: "Back to login" }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fcheckout/);
  await page.getByPlaceholder("Enter email address").fill("juliet@example.com");
  await page.getByPlaceholder("Enter password").fill("newpassword1");
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  // Signed in and back on the checkout: the booking and phone are still there.
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByLabel("Phone number")).toHaveValue("7016377711");
  await expect(page.getByText("Lagos Food Walk").first()).toBeVisible();
  await page.getByRole("button", { name: "Confirm and pay" }).click();

  await expect(page).toHaveURL("https://paystack.test/pay");
  expect(bookingBody).toMatchObject({ experience_id: "exp-1", guide_id: "guide-1" });
});
