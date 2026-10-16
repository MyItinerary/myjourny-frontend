import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { BookingConfirmedEmailView } from "./booking-confirmed-email-view";
import { mockBookingConfirmedEmail } from "./test-fixtures";

describe("BookingConfirmedEmailView", () => {
  it("renders booking details, date, time and confirmation code", () => {
    renderWithProviders(<BookingConfirmedEmailView data={mockBookingConfirmedEmail} />);

    expect(screen.getByText("BOOKING CONFIRMED")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your next experience starts Saturday" }),
    ).toBeInTheDocument();
    expect(screen.getByText(mockBookingConfirmedEmail.date)).toBeInTheDocument();
    expect(screen.getByText(mockBookingConfirmedEmail.confirmationCode)).toBeInTheDocument();
  });

  it("renders host info, included items and manage booking link", () => {
    renderWithProviders(<BookingConfirmedEmailView data={mockBookingConfirmedEmail} />);

    expect(
      screen.getByText(`Hosted by ${mockBookingConfirmedEmail.host.name}`),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What's included" })).toBeInTheDocument();
    expect(screen.getByText("Manage booking")).toBeInTheDocument();
  });
});
