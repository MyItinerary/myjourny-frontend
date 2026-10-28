import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { BookingPaymentStatus } from "./booking-payment-status";

const sessionState = { hydrated: true, user: { id: "u-1" } as { id: string } | null };
const bookingState = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
};
const retryMutate = vi.fn();

vi.mock("@/lib/auth/session-store", () => ({
  useSession: () => sessionState,
}));

vi.mock("@/lib/queries/bookings", async () => {
  const actual = await vi.importActual<typeof import("@/lib/queries/bookings")>("@/lib/queries/bookings");
  return {
    ...actual,
    useBooking: () => bookingState,
    useRetryBookingPayment: () => ({ mutate: retryMutate, isPending: false }),
  };
});

vi.mock("@/features/checkout", () => ({
  BookingConfirmedView: () => <div data-testid="confirmed-booking">You’re going!</div>,
  useBookingConfirmation: () => ({}),
}));

const baseBooking = {
  id: "b-1",
  experience_id: "exp-1",
  status: "confirmed",
  payment_status: "paid",
  party_size: 1,
  currency: "NGN",
  line_items: [],
};

describe("BookingPaymentStatus", () => {
  beforeEach(() => {
    sessionState.hydrated = true;
    sessionState.user = { id: "u-1" };
    bookingState.data = undefined;
    bookingState.isLoading = false;
    bookingState.isError = false;
    retryMutate.mockClear();
  });

  it("shows checking status during hydration or initial load without a booking", () => {
    sessionState.hydrated = false;
    bookingState.isLoading = true;

    renderWithProviders(<BookingPaymentStatus bookingId="b-1" landedFrom="success" />);

    expect(screen.getByText("Checking your payment…")).toBeInTheDocument();
  });

  it("renders confirmed booking screen when booking is confirmed", () => {
    bookingState.data = { ...baseBooking, status: "confirmed", payment_status: "paid" };

    renderWithProviders(<BookingPaymentStatus bookingId="b-1" landedFrom="success" />);

    expect(screen.getByTestId("confirmed-booking")).toBeInTheDocument();
  });

  it("renders cancelled screen when booking was cancelled", () => {
    bookingState.data = { ...baseBooking, status: "cancelled", payment_status: "paid" };

    renderWithProviders(<BookingPaymentStatus bookingId="b-1" landedFrom="success" />);

    expect(screen.getByText("Booking cancelled")).toBeInTheDocument();
  });

  it("renders confirming payment screen while the booking is pending and unpaid", () => {
    bookingState.data = { ...baseBooking, status: "pending", payment_status: "unpaid" };

    renderWithProviders(<BookingPaymentStatus bookingId="b-1" landedFrom="success" />);

    expect(screen.getByText("Confirming your payment…")).toBeInTheDocument();
  });

  it("offers a retry after a declined payment releases the booking", () => {
    // itin cancels the pending, unpaid booking when the provider reports a decline.
    bookingState.data = { ...baseBooking, status: "cancelled", payment_status: "unpaid" };

    renderWithProviders(<BookingPaymentStatus bookingId="b-1" landedFrom="cancel" />);

    expect(screen.getByText("Payment not completed")).toBeInTheDocument();
    expect(screen.queryByText("Confirming your payment…")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try payment again" })).toBeInTheDocument();
  });

  it("offers a retry once the unpaid hold has expired", () => {
    bookingState.data = { ...baseBooking, status: "expired", payment_status: "unpaid" };

    renderWithProviders(<BookingPaymentStatus bookingId="b-1" landedFrom="success" />);

    expect(screen.getByText("Payment not completed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try payment again" })).toBeInTheDocument();
  });

  it("renders fallback confirmation note when booking could not be loaded after landing from success", () => {
    bookingState.data = undefined;
    bookingState.isLoading = false;

    renderWithProviders(<BookingPaymentStatus bookingId="b-1" landedFrom="success" />);

    expect(screen.getByText("Thanks — we're confirming your payment")).toBeInTheDocument();
  });

  it("renders fallback not completed note when booking could not be loaded after landing from cancel", () => {
    bookingState.data = undefined;
    bookingState.isLoading = false;

    renderWithProviders(<BookingPaymentStatus bookingId="b-1" landedFrom="cancel" />);

    expect(screen.getByText("Payment not completed")).toBeInTheDocument();
  });
});
