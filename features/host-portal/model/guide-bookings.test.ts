import { describe, expect, it } from "vitest";

import { bookingRef, isPaid, toHostBooking } from "./guide-bookings";
import type { GuideBooking } from "./guide-bookings.types";

const TODAY = "2026-09-19";
const booking = (over: Partial<GuideBooking> = {}): GuideBooking => ({
  id: "3f2a9c1e-77aa-4b1c-9d0e-123456789abc",
  status: "confirmed",
  payment_status: "paid",
  payout_status: "pending",
  experience_title: "Lagoon kayak",
  requested_datetime: "2026-09-20T07:30:00",
  party_size: 3,
  price_total: "45000.00",
  guide_earnings_amount: "38250.00",
  line_items: [{ label: "Adult", quantity: 3 }],
  guest: { name: "Amaka Eze", avatar_url: "https://cdn/amaka.jpg", phone: "+2348012345678" },
  created_at: "2026-09-01T10:00:00",
  ...over,
});

describe("toHostBooking", () => {
  it("shows an upcoming booking with the guest, the money and their phone", () => {
    expect(toHostBooking(booking(), TODAY)).toMatchObject({
      ref: "3F2A9C1E",
      tab: "Upcoming",
      when: "tomorrow",
      listing: "Lagoon kayak",
      date: "Sun 20 Sept",
      name: "Amaka Eze",
      avatarUrl: "https://cdn/amaka.jpg",
      rowNote: "",
      line: "Lagoon kayak · Sun 20 Sept, 07:30",
      money: "3 places · ₦45,000",
      gross: "₦45,000",
      net: "₦38,250",
      status: "Confirmed",
      isRequest: false,
      contact: "+2348012345678",
      facts: [
        { label: "Guests", value: "3" },
        { label: "They paid", value: "₦45,000" },
        { label: "Our share", value: "₦6,750" },
        { label: "You receive", value: "₦38,250" },
      ],
      timeline: [],
    });
  });

  it("says when a confirmed guest has no verified phone", () => {
    expect(toHostBooking(booking({ guest: { name: null } }), TODAY)).toMatchObject({ name: "Guest", contact: expect.stringMatching(/verified phone/) });
  });

  it("lists the ticket types when there are several", () => {
    const b = booking({ line_items: [{ label: "Adult", quantity: 2 }, { label: "Child", quantity: 1 }] });
    expect(toHostBooking(b, TODAY).rowNote).toBe("2 × Adult, 1 × Child");
  });

  it("files a finished booking as completed, or paid out once the guide is paid", () => {
    const done = toHostBooking(booking({ status: "completed", requested_datetime: "2026-09-12T07:30:00" }), TODAY);
    expect(done).toMatchObject({ tab: "Completed", when: "past", status: "Completed", contact: "Only shown while a booking is confirmed." });
    expect(done.facts[3]).toEqual({ label: "You received", value: "₦38,250" });
    expect(toHostBooking(booking({ status: "completed", payout_status: "paid" }), TODAY).status).toBe("Paid out");
  });

  it("explains a cancellation and where the money went", () => {
    const b = toHostBooking(booking({ status: "cancelled", cancelled_by: "guest", refunded_amount: "45000.00" }), TODAY);
    expect(b).toMatchObject({ tab: "Cancelled", status: "Cancelled by guest" });
    expect(b.facts[3]).toEqual({ label: "You received", value: "₦0" });
    expect(b.timeline).toEqual([
      { title: "Booked", body: "3 places for ₦45,000." },
      { title: "Cancelled by guest", body: "₦45,000 went back to the guest." },
    ]);
    expect(toHostBooking(booking({ status: "cancelled", cancelled_by: "admin" }), TODAY).timeline[1]).toEqual({
      title: "Cancelled",
      body: "Any refund is handled by MyJourny.",
    });
  });

  it("places today, later and an unset date", () => {
    expect(toHostBooking(booking({ requested_datetime: "2026-09-19T16:00:00" }), TODAY).when).toBe("today");
    expect(toHostBooking(booking({ requested_datetime: "2026-10-01T16:00:00" }), TODAY).when).toBe("later");
    expect(toHostBooking(booking({ requested_datetime: null }), TODAY)).toMatchObject({ when: "later", date: "Date to be set", line: "Lagoon kayak · Date to be set" });
  });
});

describe("helpers", () => {
  it("matches the reference guests see, and skips unpaid checkouts", () => {
    expect(bookingRef("ab12cd34-0000-0000-0000-000000000000")).toBe("AB12CD34");
    expect([isPaid(booking()), isPaid(booking({ payment_status: "unpaid" }))]).toEqual([true, false]);
  });
});
