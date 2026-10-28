import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ExternalBookingView } from "./external-booking-view";

describe("ExternalBookingView", () => {
  it("links a signed-in guest to the host's booking page", () => {
    renderWithProviders(<ExternalBookingView url="https://tickets.example.com/kayak" loginHref="/login" />);
    const link = screen.getByRole("link", { name: /Book on the host's site/ });
    expect(link).toHaveAttribute("href", "https://tickets.example.com/kayak");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("asks a guest to log in for the link, which only signed-in users get", () => {
    renderWithProviders(<ExternalBookingView url={null} loginHref="/login?next=%2Fexperiences%2Fexp-1" />);
    expect(screen.getByRole("link", { name: "Log in to see the booking link" })).toHaveAttribute(
      "href",
      "/login?next=%2Fexperiences%2Fexp-1",
    );
  });
});
