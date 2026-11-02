import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { BookingAvatar, StatusChip } from "./host-booking-parts";

describe("StatusChip", () => {
  it("shows the label in the colour of the matching status", () => {
    renderWithProviders(
      <>
        <StatusChip status="Live" label="Confirmed" />
        <StatusChip status="In review" label="Waiting on you" />
        <StatusChip status="Rejected" label="Cancelled by guest" />
        <StatusChip status="Draft" label="Paid out" />
      </>,
    );
    expect(screen.getByText("Confirmed")).toHaveClass("text-[#0CBA65]");
    expect(screen.getByText("Waiting on you")).toHaveClass("text-[#B4760A]");
    expect(screen.getByText("Cancelled by guest")).toHaveClass("text-[#F5032D]");
    expect(screen.getByText("Paid out")).toHaveClass("text-[#6F6B72]");
  });
});

describe("BookingAvatar", () => {
  it("shows initials when there's no photo", () => {
    renderWithProviders(<BookingAvatar name="Amaka Eze" url={null} size={32} />);
    expect(screen.getByText("AE")).toBeInTheDocument();
  });

  it("uses at most two initials", () => {
    renderWithProviders(<BookingAvatar name="Ifeoma Ada Adeyemi" url={null} size={32} />);
    expect(screen.getByText("IA")).toBeInTheDocument();
  });

  it("shows the photo when there is one", () => {
    const { container } = renderWithProviders(<BookingAvatar name="Amaka Eze" url="/amaka.jpg" size={52} />);
    expect(container.querySelector("img")).toHaveAttribute("src", expect.stringContaining("amaka"));
    expect(screen.queryByText("AE")).not.toBeInTheDocument();
  });
});
