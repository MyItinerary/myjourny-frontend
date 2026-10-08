import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { BookingDetail } from "./booking-detail";

const booking = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => null }));
vi.mock("@/components/home/footer", () => ({ Footer: () => null }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => ({ user: { id: "u-1" } }) }));
vi.mock("@/lib/queries/experiences", () => ({ useExperienceDetail: () => ({ data: { title: "Lagos Food Walk" } }) }));
vi.mock("@/lib/queries/bookings", () => ({
  useBooking: () => ({ data: booking.current, isLoading: false, isError: false }),
  useCancellationRequest: () => ({ data: null }),
  useRequestCancellation: () => ({ mutate: vi.fn(), isPending: false }),
}));

const base = {
  id: "abcdef12-0000",
  experience_id: "exp-1",
  status: "confirmed",
  payment_status: "paid",
  party_size: 2,
  currency: "NGN",
  line_items: [],
};

describe("BookingDetail session time", () => {
  it("shows the session in its own time zone", () => {
    booking.current = { ...base, requested_datetime: "2030-06-01T08:00:00", session_timezone: "Africa/Lagos" };
    renderWithProviders(<BookingDetail bookingId="b-1" />);

    expect(screen.getByText("Saturday, June 1 at 9:00 AM")).toBeInTheDocument();
  });

  it("shows a session over several days as a date range", () => {
    booking.current = {
      ...base,
      requested_datetime: "2030-06-01T08:00:00",
      session_end_at: "2030-06-03T10:00:00",
      session_timezone: "Africa/Lagos",
    };
    renderWithProviders(<BookingDetail bookingId="b-1" />);

    expect(screen.getByText("Sat, June 1 at 9:00 AM – Mon, June 3")).toBeInTheDocument();
  });
});
