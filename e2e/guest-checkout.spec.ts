import type { Page } from "@playwright/test";

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

const SIGNED_IN = {
  accessToken: "e2e-access",
  refreshToken: "e2e-refresh",
  user: { id: "user-1", email: "juliet@example.com", fullName: null, avatarUrl: null },
};

type Handlers = Parameters<typeof mockApi>[1];

/** The experience, its prices and sessions, a public quote, and a booking
 * that hands over to the payment page. `booked` reads back what was sent. */
async function mockBooking(page: Page, extra: Handlers = {}) {
  const booked: Record<string, unknown>[] = [];
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
    "POST /bookings/quote": (r) => r.fulfill({ json: QUOTE }),
    "GET /auth/me": (r) =>
      r.fulfill({ json: { id: "user-1", email: "juliet@example.com", full_name: null, avatar_url: null } }),
    "POST /bookings": async (r) => {
      booked.push(r.request().postDataJSON());
      await r.fulfill({ json: { id: "b-1", status: "pending", payment_status: "unpaid", url: "https://paystack.test/pay" } });
    },
    ...extra,
  });
  return booked;
}

async function bookNow(page: Page) {
  await page.goto("/experiences/exp-1");
  await page.locator("div.sticky").getByRole("button", { name: /Book now/ }).click();
  await expect(page).toHaveURL(/\/checkout$/);
}

async function startLogIn(page: Page, email = "juliet@example.com") {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Log in or sign up").last()).toBeVisible();
  await page.getByPlaceholder("Enter email address").fill(email);
  await page.getByRole("dialog").getByRole("button", { name: "Continue", exact: true }).click();
}

test("a guest books like on Airbnb: log in or sign up first, then confirm and pay", async ({ page }) => {
  let registerBody: Record<string, unknown> | null = null;
  const booked = await mockBooking(page, {
    "POST /auth/email-exists": (r) => r.fulfill({ json: { exists: false, has_password: false } }),
    "POST /auth/register": (r) => {
      registerBody = r.request().postDataJSON();
      return r.fulfill({ json: { access_token: "new-access", refresh_token: "new-refresh" } });
    },
  });

  await bookNow(page);
  await expect(page.getByRole("heading", { name: "Confirm and pay" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Log in or sign up" })).toBeVisible();
  // Nothing to pay before step 1 is done.
  await expect(page.getByRole("button", { name: "Confirm and pay" })).toHaveCount(0);

  // A new email: create a password with the usual rules.
  await startLogIn(page);
  await expect(page.getByText("Create a password")).toBeVisible();
  const agree = page.getByRole("button", { name: "Agree and continue" });
  await page.getByPlaceholder("Enter password here", { exact: true }).fill("longenough1");
  await page.getByPlaceholder("Re enter password here").fill("longenough2");
  await expect(page.getByText("The passwords don't match")).toBeVisible();
  await expect(agree).toBeDisabled();
  await page.getByPlaceholder("Re enter password here").fill("longenough1");
  await agree.click();

  // Signed up: step 1 is done and step 2 pays.
  await expect(page.getByText("Logged in as juliet@example.com")).toBeVisible();
  await page.getByRole("button", { name: "Confirm and pay" }).click();

  await expect(page).toHaveURL("https://paystack.test/pay");
  expect(registerBody).toMatchObject({ email: "juliet@example.com", password: "longenough1" });
  expect(booked[0]).toMatchObject({ experience_id: "exp-1", guide_id: "guide-1" });
});

test("an email with an account logs in with its password, then confirms and pays", async ({ page }) => {
  const booked = await mockBooking(page, {
    "POST /auth/email-exists": (r) => r.fulfill({ json: { exists: true, has_password: true } }),
    "POST /auth/login": (r) => r.fulfill({ json: { access_token: "login-access", refresh_token: "login-refresh" } }),
  });

  await bookNow(page);
  await startLogIn(page);
  await expect(page.getByText("Welcome back!")).toBeVisible();
  await page.getByPlaceholder("Enter password").fill("secret123");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText("Logged in as juliet@example.com")).toBeVisible();
  await page.getByRole("button", { name: "Confirm and pay" }).click();
  await expect(page).toHaveURL("https://paystack.test/pay");
  expect(booked).toHaveLength(1);
});

test("an email that only signs in with Google is pointed to Google", async ({ page }) => {
  await mockBooking(page, {
    "POST /auth/email-exists": (r) => r.fulfill({ json: { exists: true, has_password: false } }),
  });

  await bookNow(page);
  await startLogIn(page);
  await expect(page.getByText("This email signs in with Google.")).toBeVisible();
  await expect(page.getByPlaceholder("Enter password")).toHaveCount(0);
});

test("a signed-in user lands on the checkout with step 1 done", async ({ page }) => {
  await page.addInitScript((auth) => window.localStorage.setItem("myjourny:auth", JSON.stringify(auth)), SIGNED_IN);
  const booked = await mockBooking(page);

  await bookNow(page);
  await expect(page.getByText("Logged in as juliet@example.com")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Confirm and pay" }).click();

  await expect(page).toHaveURL("https://paystack.test/pay");
  expect(booked).toHaveLength(1);
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

test("resetting a password from the checkout leads back to it, with the booking still there", async ({ page }) => {
  const booked = await mockBooking(page, {
    "POST /auth/email-exists": (r) => r.fulfill({ json: { exists: true, has_password: true } }),
    "POST /auth/password/request-reset": (r) => r.fulfill({ json: { message: "ok" } }),
    "POST /auth/password/reset-with-token": (r) => r.fulfill({ json: { message: "ok" } }),
    "POST /auth/login": (r) => r.fulfill({ json: { access_token: "login-access", refresh_token: "login-refresh" } }),
  });

  await bookNow(page);
  await startLogIn(page);
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

  // Signed in and back on the checkout, with the booking still there.
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByText("Logged in as juliet@example.com")).toBeVisible();
  await expect(page.getByText("Lagos Food Walk").first()).toBeVisible();
  await page.getByRole("button", { name: "Confirm and pay" }).click();

  await expect(page).toHaveURL("https://paystack.test/pay");
  expect(booked[0]).toMatchObject({ experience_id: "exp-1", guide_id: "guide-1" });
});
