import type { ListingStatus } from "./home.types";
import type { BookingFilters, BookingStatusLabel, BookingTab, BookingWhenFilter, HostBooking } from "./bookings.types";

export const BOOKING_STATUS_OPTIONS: BookingTab[] = ["Requests", "Upcoming", "Completed", "Cancelled"];

export const BOOKING_WHEN_OPTIONS: BookingWhenFilter[] = ["Today", "Tomorrow", "Still to come", "Already run"];

export const NO_BOOKING_FILTERS: BookingFilters = { q: "", status: "All", listing: "All", when: "All dates" };

export const hasActiveBookingFilters = (f: BookingFilters) =>
  f.status !== "All" || f.listing !== "All" || f.when !== "All dates" || f.q !== "";

function whenOk(booking: HostBooking, when: BookingWhenFilter) {
  switch (when) {
    case "All dates":
      return true;
    case "Today":
      return booking.when === "today";
    case "Tomorrow":
      return booking.when === "tomorrow";
    case "Still to come":
      return booking.tab === "Upcoming" || booking.tab === "Requests";
    default:
      return booking.tab === "Completed";
  }
}

const TAB_ORDER: Record<BookingTab, number> = { Requests: 0, Upcoming: 1, Completed: 2, Cancelled: 3 };

/** Filtered, with requests first and cancellations last, keeping the given order within each. */
export function filterBookings(bookings: HostBooking[], f: BookingFilters): HostBooking[] {
  const q = f.q.toLowerCase();
  return bookings
    .filter(
      (b) =>
        (f.status === "All" || b.tab === f.status) &&
        (f.listing === "All" || b.listing === f.listing) &&
        whenOk(b, f.when) &&
        (b.name.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q)),
    )
    .sort((a, b) => TAB_ORDER[a.tab] - TAB_ORDER[b.tab]);
}

/** "All 6 bookings", "1 booking", "3 bookings" */
export function bookingsResultLine(shown: number, total: number): string {
  if (shown === total) return `All ${total} bookings`;
  return shown === 1 ? "1 booking" : `${shown} bookings`;
}

/** "2 requests waiting on you", for the page header. */
export function bookingsSummary(bookings: HostBooking[]): string {
  if (bookings.length === 0) return "No bookings yet";
  const waiting = bookings.filter((b) => b.isRequest).length;
  if (waiting === 0) return "Nothing waiting on you";
  return `${waiting} ${waiting === 1 ? "request" : "requests"} waiting on you`;
}

/** The status chip reuses the listing chip colours: confirmed is green, waiting is amber, cancelled is red, the rest grey. */
export function bookingChip(status: BookingStatusLabel): ListingStatus {
  return status === "Confirmed" ? "Live" : status === "Waiting on you" ? "In review" : status === "Cancelled by guest" ? "Rejected" : "Draft";
}

export const uniqueListings = (bookings: HostBooking[]) => [...new Set(bookings.map((b) => b.listing))];
