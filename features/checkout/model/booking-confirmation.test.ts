import { describe, expect, it } from "vitest";

import type { Booking } from "@/lib/queries/bookings";

import { buildBookingConfirmation } from "./booking-confirmation";

const booking: Booking = {
  id: "b-1",
  experience_id: "exp-1",
  status: "confirmed",
  payment_status: "paid",
  requested_datetime: "2026-07-16T08:00:00",
  party_size: 1,
  price_total: "10000.00",
  currency: "NGN",
};

describe("buildBookingConfirmation", () => {
  it("describes the booking and links to it and the calendar", () => {
    const confirmation = buildBookingConfirmation(booking, {
      id: "exp-1",
      status: "ACTIVE",
      title: "Kayaking",
      cover_image_url: "/kayak.jpg",
      duration_minutes: 150,
    });

    expect(confirmation).toMatchObject({
      title: "Kayaking",
      imageUrl: "/kayak.jpg",
      dateLabel: "July 16th, 2026",
      guestsLabel: "1 guest",
      totalLabel: "₦10,000.00",
      viewHref: "/bookings/b-1",
    });
    expect(confirmation.calendarHref).toContain("calendar.google.com");
  });

  it("copes with the experience not having loaded", () => {
    const confirmation = buildBookingConfirmation({ ...booking, party_size: 3, price_total: null });
    expect(confirmation).toMatchObject({ title: "Your experience", imageUrl: null, guestsLabel: "3 guests", totalLabel: null });
  });
});
