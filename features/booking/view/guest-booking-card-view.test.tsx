import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { GuestBookingCardView } from "./guest-booking-card-view";

describe("GuestBookingCardView", () => {
  it("shows the price and sends guests to log in", () => {
    renderWithProviders(<GuestBookingCardView priceFrom="₦5,000.00" loginHref="/login?next=%2Fexperiences%2Fe" />);

    expect(screen.getByText("₦5,000.00")).toBeInTheDocument();
    // The button renders as the link itself.
    expect(screen.getByText("Log in to book").closest("a")).toHaveAttribute(
      "href",
      "/login?next=%2Fexperiences%2Fe",
    );
  });

  it("leaves out the price when there are no tickets", () => {
    renderWithProviders(<GuestBookingCardView priceFrom={null} loginHref="/login" />);
    expect(screen.queryByText("from")).not.toBeInTheDocument();
  });
});
