import { describe, expect, it } from "vitest";

import {
  BOOKING_STATUS_OPTIONS,
  BOOKING_WHEN_OPTIONS,
  bookingChip,
  bookingsResultLine,
  bookingsSummary,
  filterBookings,
  hasActiveBookingFilters,
  NO_BOOKING_FILTERS,
  uniqueListings,
} from "./booking-table";
import { sampleBookings } from "./sample-bookings";

const bookings = sampleBookings("2026-09-19");
const names = (list: { name: string }[]) => list.map((b) => b.name);

describe("filterBookings", () => {
  it("puts requests first and cancellations last", () => {
    expect(names(filterBookings(bookings, NO_BOOKING_FILTERS))).toEqual([
      "Amaka Eze", "Chidi Okafor", "Ifeoma Adeyemi", "Yemi Balogun", "Segun Olaniyi", "Bisi Lawal",
    ]);
  });

  it("filters by status and listing", () => {
    expect(names(filterBookings(bookings, { ...NO_BOOKING_FILTERS, status: "Upcoming" }))).toEqual(["Ifeoma Adeyemi", "Yemi Balogun"]);
    expect(names(filterBookings(bookings, { ...NO_BOOKING_FILTERS, listing: "Freedom Park Portraits" }))).toEqual(["Yemi Balogun"]);
  });

  it("filters by when", () => {
    expect(names(filterBookings(bookings, { ...NO_BOOKING_FILTERS, when: "Tomorrow" }))).toEqual(["Amaka Eze", "Ifeoma Adeyemi"]);
    expect(filterBookings(bookings, { ...NO_BOOKING_FILTERS, when: "Today" })).toEqual([]);
    expect(filterBookings(bookings, { ...NO_BOOKING_FILTERS, when: "Still to come" })).toHaveLength(4);
    expect(names(filterBookings(bookings, { ...NO_BOOKING_FILTERS, when: "Already run" }))).toEqual(["Segun Olaniyi"]);
  });

  it("searches by guest name or reference, ignoring case", () => {
    expect(names(filterBookings(bookings, { ...NO_BOOKING_FILTERS, q: "ifeoma" }))).toEqual(["Ifeoma Adeyemi"]);
    expect(names(filterBookings(bookings, { ...NO_BOOKING_FILTERS, q: "mj-4488" }))).toEqual(["Yemi Balogun"]);
    expect(filterBookings(bookings, { ...NO_BOOKING_FILTERS, q: "zzz" })).toEqual([]);
  });
});

describe("summaries", () => {
  it("words the result count", () => {
    expect(bookingsResultLine(6, 6)).toBe("All 6 bookings");
    expect(bookingsResultLine(1, 6)).toBe("1 booking");
    expect(bookingsResultLine(3, 6)).toBe("3 bookings");
  });

  it("summarises the page header", () => {
    expect(bookingsSummary(bookings)).toBe("2 requests waiting on you");
    expect(bookingsSummary(bookings.filter((b) => b.id === "b1"))).toBe("1 request waiting on you");
    expect(bookingsSummary(bookings.filter((b) => !b.isRequest))).toBe("Nothing waiting on you");
    expect(bookingsSummary([])).toBe("No bookings yet");
  });

  it("knows when a filter is on", () => {
    expect(hasActiveBookingFilters(NO_BOOKING_FILTERS)).toBe(false);
    expect(hasActiveBookingFilters({ ...NO_BOOKING_FILTERS, q: "x" })).toBe(true);
    expect(hasActiveBookingFilters({ ...NO_BOOKING_FILTERS, when: "Today" })).toBe(true);
  });
});

describe("reference data", () => {
  it("has the four tabs and four when options", () => {
    expect(BOOKING_STATUS_OPTIONS).toHaveLength(4);
    expect(BOOKING_WHEN_OPTIONS).toEqual(["Today", "Tomorrow", "Still to come", "Already run"]);
  });

  it("lists each listing once", () => {
    expect(uniqueListings(bookings)).toEqual(["Lagos Island Photowalk", "Freedom Park Portraits"]);
  });

  it("colours a status like the matching listing status", () => {
    expect(bookingChip("Confirmed")).toBe("Live");
    expect(bookingChip("Waiting on you")).toBe("In review");
    expect(bookingChip("Cancelled by guest")).toBe("Rejected");
    expect(bookingChip("Paid out")).toBe("Draft");
  });
});
