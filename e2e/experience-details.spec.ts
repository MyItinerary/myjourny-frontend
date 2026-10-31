import type { Page, Route } from "@playwright/test";

import { expect, mockApi, test } from "./fixtures";

const EXPERIENCE = {
  id: "exp-1",
  guide_id: "guide-1",
  status: "ACTIVE",
  title: "Makoko Floating Village Boat Tour",
  city: "Lagos",
  country: "Nigeria",
  currency: "NGN",
  duration_minutes: 90,
  group_size_min: 1,
  group_size_max: 6,
  rating: null,
  cancellation_policy: "Free cancellation up to 24 hours before",
  images: [],
  itinerary: [
    { title: "Board the canoe", description: "Your guide is a Makoko resident." },
    { title: "Fish market stop", description: "Stop at a local fish market." },
  ],
  host: { id: "guide-1", display_name: "Kayan Thrille", is_verified: true },
};

const PRICING = {
  currency: "NGN",
  prices: [{ id: "adult", label: "Standard", amount: "7500", pricing_unit: "per_person" }],
  addons: [],
  rules: [],
};

const MEETING_POINT = {
  latitude: 6.495852,
  longitude: 3.392337,
  instructions: "Wait by the blue gate at the Third Mainland jetty",
  city: "Lagos",
  country: "Nigeria",
};

async function signIn(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "myjourny:auth",
      JSON.stringify({
        accessToken: "e2e-access",
        refreshToken: "e2e-refresh",
        user: { id: "user-1", email: "adaeze@example.com", fullName: "Adaeze Okafor", avatarUrl: null },
      }),
    );
  });
}

test.beforeEach(async ({ page }) => {
  // The map is an OpenStreetMap embed; keep the test off the real network.
  await page.route("https://www.openstreetmap.org/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<html><body>map</body></html>" }),
  );
});

function experienceApi(experience: Record<string, unknown>, extra = {}) {
  return {
    "GET /experiences/exp-1": (r: Route) => r.fulfill({ json: experience }),
    "GET /experiences/exp-1/pricing": (r: Route) =>
      r.fulfill({ json: PRICING }),
    "GET /experiences/exp-1/sessions": (r: Route) =>
      r.fulfill({ json: { timezone: "Africa/Lagos", scheduled: false, sessions: [] } }),
    ...extra,
  };
}

test("a guest sees the real itinerary, policy and rating, with no made-up details", async ({ page }) => {
  await mockApi(page, experienceApi(EXPERIENCE));
  await page.goto("/experiences/exp-1");
  await expect(page.getByRole("heading", { name: "Makoko Floating Village Boat Tour" }).first()).toBeVisible();

  const itinerary = page.locator("section").filter({ has: page.getByRole("heading", { name: "Itinerary" }) });
  await expect(itinerary.getByRole("listitem").nth(0)).toContainText("Board the canoe");
  await expect(itinerary.getByRole("listitem").nth(1)).toContainText("Fish market stop");
  await expect(page.getByText("Await hotel pickup")).toHaveCount(0);

  await expect(page.getByText("No reviews yet", { exact: true })).toBeVisible();
  // No "0.0" star next to the title either.
  await expect(page.getByText("0.0", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/168 reviews/)).toHaveCount(0);
  await expect(page.getByText("Bank transfer and cash accepted")).toHaveCount(0);
  await expect(page.getByText("Up to 24 hours before, full refund")).toHaveCount(0);
  // The policy is not in "Before you book": the booking card says 24 hours, and its tooltip carries the policy.
  await expect(page.getByText("Free cancellation up to 24 hours before")).toHaveCount(0);
  await expect(page.getByText("You can only cancel up to 24 hours before the experience.").first()).toBeVisible();
  await page.getByRole("button", { name: "About the cancellation policy" }).first().hover();
  await expect(page.getByText("Free cancellation up to 24 hours before")).toBeVisible();

  // Guests get no coordinates, so only the city and the promise of the exact spot.
  await expect(page.getByText("Exact meeting point shared after booking.")).toBeVisible();
});

test("a booked traveller sees the exact meeting point on the experience page", async ({ page }) => {
  await signIn(page);
  await mockApi(
    page,
    experienceApi(
      { ...EXPERIENCE, latitude: 6.5, longitude: 3.39 },
      {
        "GET /bookings": (r: Route) =>
          r.fulfill({
            json: [{ id: "b-1", experience_id: "exp-1", status: "confirmed", meeting_point: MEETING_POINT }],
          }),
      },
    ),
  );
  await page.goto("/experiences/exp-1");

  await expect(page.getByText("You're booked. Here's where to meet.")).toBeVisible();
  await expect(page.getByText(MEETING_POINT.instructions)).toBeVisible();
  await expect(page.getByTitle("Meeting point map")).toHaveAttribute("src", /marker=6\.495852%2C3\.392337/);
  await expect(page.getByRole("link", { name: "Get directions" })).toHaveAttribute(
    "href",
    "https://www.google.com/maps/dir/?api=1&destination=6.495852,3.392337",
  );
});

test("the booking page shows where to meet and what to bring", async ({ page }) => {
  await signIn(page);
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
          requested_datetime: "2030-06-01T11:00:00",
          session_timezone: "Africa/Lagos",
          party_size: 2,
          price_total: "15431.48",
          currency: "NGN",
          line_items: [],
          meeting_point: MEETING_POINT,
          what_to_bring: "Sunscreen and a hat",
          created_at: "2030-05-01T10:00:00",
          updated_at: "2030-05-01T10:00:00",
        },
      }),
    "GET /bookings/b-1/cancellation": (r) => r.fulfill({ json: null }),
    "GET /experiences/exp-1": (r) => r.fulfill({ json: EXPERIENCE }),
  });
  await page.goto("/bookings/b-1");

  await expect(page.getByRole("heading", { name: "Where to meet" })).toBeVisible();
  await expect(page.getByText(MEETING_POINT.instructions)).toBeVisible();
  await expect(page.getByText("Sunscreen and a hat")).toBeVisible();
});

test("guest limits, exclusions and safety notes show before booking", async ({ page }) => {
  await mockApi(
    page,
    experienceApi({
      ...EXPERIENCE,
      title: "Lagos Trivia Night",
      group_size_min: 3,
      group_size_max: 8,
      whats_not_included: ["Drinks"],
      safety_info: { riskLevel: "LOW", notes: ["Venue has step-free access"], mobilityAccessibility: "FULL" },
    }),
  );
  await page.goto("/experiences/exp-1");
  await expect(page.getByRole("heading", { name: "Lagos Trivia Night" }).first()).toBeVisible();

  const beforeYouBook = page.locator("section").filter({ has: page.getByRole("heading", { name: "Before you book" }) });
  await expect(beforeYouBook.getByText("3–8 guests per booking")).toBeVisible();
  // Exclusions and safety notes have their own sections further down the page.
  await expect(page.getByText("Drinks")).toBeVisible();
  await expect(page.getByText("Venue has step-free access")).toBeVisible();

  // The booking card keeps to what it needs: the limits are on the page, not under the guests.
  const panel = page.locator("div.sticky").filter({ hasText: "Guests" });
  await expect(panel.getByText("3–8 guests per booking")).toHaveCount(0);
});

test("itin's placeholder safety info isn't shown", async ({ page }) => {
  await mockApi(
    page,
    experienceApi({
      ...EXPERIENCE,
      safety_info: {
        riskLevel: "UNKNOWN",
        notes: ["Safety info not available"],
        mobilityAccessibility: "UNKNOWN",
        emergencyGuidance: "Follow general travel safety disclaimer.",
      },
    }),
  );
  await page.goto("/experiences/exp-1");
  await expect(page.getByRole("heading", { name: "Makoko Floating Village Boat Tour" }).first()).toBeVisible();
  await expect(page.getByText("Safety info not available")).toHaveCount(0);
  await expect(page.getByText("Follow general travel safety disclaimer.")).toHaveCount(0);
});

test("the page shows the host's fit details, lists, paragraphs and meeting landmark", async ({ page }) => {
  await page.route("https://img.example/**", (route) => route.fulfill({ contentType: "image/svg+xml", body: "<svg xmlns='http://www.w3.org/2000/svg'/>" }));
  await mockApi(
    page,
    experienceApi({
      ...EXPERIENCE,
      description: "Paddle through the stilt village at sunrise.\n\nBreakfast is on the jetty.",
      fitness_level: "moderate",
      fitness_note: "Two hours in a canoe",
      age_policy: "minimum_age",
      min_age: 12,
      accessibility: "not_confirmed",
      languages: ["en", "yo"],
      weather_dependent: true,
      highlights: ["See the floating school"],
      what_to_bring_items: ["Sunscreen", "A light layer"],
      not_suitable_for: ["Guests who can't swim"],
      meeting_landmark: "The blue gate at the Third Mainland jetty",
      meeting_photo_url: "https://img.example/gate.jpg",
    }),
  );
  await page.goto("/experiences/exp-1");
  await expect(page.getByRole("heading", { name: "Makoko Floating Village Boat Tour" }).first()).toBeVisible();

  await expect(page.getByText("Breakfast is on the jetty.")).toBeVisible();
  const fit = page.locator("section").filter({ has: page.getByRole("heading", { name: "Before you book" }) });
  await expect(fit.getByText("Moderate. Two hours in a canoe")).toBeVisible();
  await expect(fit.getByText("Ages 12+")).toBeVisible();
  await expect(fit.getByText("Not confirmed. Ask the host before you book.")).toBeVisible();
  await expect(fit.getByText("English, Yoruba")).toBeVisible();
  await expect(fit.getByText("If the weather stops it, you get a new date or a full refund.")).toBeVisible();

  const bring = page.locator("section").filter({ has: page.getByRole("heading", { name: "What to bring" }) });
  await expect(bring.getByRole("listitem")).toHaveText(["Sunscreen", "A light layer"]);
  await expect(page.getByRole("heading", { name: "Highlights" })).toBeVisible();
  await expect(page.getByText("Guests who can't swim")).toBeVisible();

  await expect(page.getByText("The blue gate at the Third Mainland jetty")).toBeVisible();
  await expect(page.getByAltText("The meeting point")).toBeVisible();
});

test("the booking card states the cancellation cutoff from the host's policy", async ({ page }) => {
  const day = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
  await mockApi(
    page,
    experienceApi(
      { ...EXPERIENCE, refund_policy: "full_refund_until", free_cancellation_hours: 48 },
      {
        "GET /experiences/exp-1/sessions": (r: Route) =>
          r.fulfill({
            json: {
              timezone: "Africa/Lagos",
              scheduled: true,
              sessions: [{ starts_at: `${day}T08:00:00Z`, local_date: day, local_time: "09:00:00", seats_left: 6, sold_out: false }],
            },
          }),
      },
    ),
  );
  await page.goto("/experiences/exp-1");

  await expect(page.locator("div.sticky").getByText(/^Full refund if you cancel before \w{3} \d{1,2} \w+, 9:00am\.$/)).toBeVisible();
  await expect(page.getByText("You can only cancel up to 24 hours before the experience.")).toHaveCount(0);
});

test("a listing that books on the host's site shows no booking card", async ({ page }) => {
  await mockApi(page, experienceApi({ ...EXPERIENCE, has_external_booking: true, booking_url: null }));
  await page.goto("/experiences/exp-1");
  await expect(page.getByRole("heading", { name: "Makoko Floating Village Boat Tour" }).first()).toBeVisible();

  await expect(page.getByRole("heading", { name: "Booked on the host's site" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in to see the booking link" })).toHaveAttribute(
    "href",
    "/login?next=%2Fexperiences%2Fexp-1",
  );
  await expect(page.getByRole("button", { name: /Book now/ })).toHaveCount(0);
});

test("a signed-in user gets the host's booking link, never the log-in prompt", async ({ page }) => {
  await signIn(page);
  await mockApi(
    page,
    experienceApi({ ...EXPERIENCE, has_external_booking: true, booking_url: "https://tickets.example.com/makoko" }),
  );
  await page.goto("/experiences/exp-1");

  await expect(page.getByRole("link", { name: /Book on the host's site/ })).toHaveAttribute(
    "href",
    "https://tickets.example.com/makoko",
  );
  await expect(page.getByText("Log in to see the booking link")).toHaveCount(0);
});
