import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { BookingDayDetails } from "../model/booking-day-details.types";
import { BookingDayDetailsView } from "./booking-day-details-view";

const EMPTY: BookingDayDetails = {
  meetingInstructions: null,
  meetingArea: null,
  mapsUrl: null,
  whatToBring: null,
  hostPhone: null,
  hostPhoneHref: null,
  calendarUrl: null,
  receiptUrl: null,
};

const FULL: BookingDayDetails = {
  meetingInstructions: "Lekki Phase 1 jetty, by the blue kiosk",
  meetingArea: "Lagos, Nigeria",
  mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=6.4281,3.4219",
  whatToBring: "Swimwear and sunscreen",
  hostPhone: "+234 803 000 0000",
  hostPhoneHref: "tel:+2348030000000",
  calendarUrl: "https://api.example.com/bookings/b1/calendar.ics?token=c",
  receiptUrl: "https://api.example.com/bookings/b1/receipt.pdf?token=r",
};

describe("BookingDayDetailsView", () => {
  it("shows where to meet, what to bring, the host's number and the downloads", () => {
    renderWithProviders(<BookingDayDetailsView details={FULL} showMeeting showDownloads />);

    expect(screen.getByRole("heading", { name: "On the day" })).toBeInTheDocument();
    expect(screen.getByText("Lekki Phase 1 jetty, by the blue kiosk")).toBeInTheDocument();
    expect(screen.getByText("Lagos, Nigeria")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get directions" })).toHaveAttribute("href", FULL.mapsUrl);
    expect(screen.getByText("Swimwear and sunscreen")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+234 803 000 0000" })).toHaveAttribute("href", "tel:+2348030000000");
    expect(screen.getByRole("link", { name: "Add to calendar" })).toHaveAttribute("href", FULL.calendarUrl);
    expect(screen.getByRole("link", { name: "Download receipt" })).toHaveAttribute("href", FULL.receiptUrl);
  });

  it("shows only the receipt link when that's all there is", () => {
    renderWithProviders(
      <BookingDayDetailsView details={{ ...EMPTY, receiptUrl: FULL.receiptUrl }} showMeeting={false} showDownloads />,
    );

    expect(screen.queryByRole("heading", { name: "On the day" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Add to calendar" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download receipt" })).toBeInTheDocument();
  });

  it("renders nothing when there's nothing to show", () => {
    const { container } = renderWithProviders(
      <BookingDayDetailsView details={EMPTY} showMeeting={false} showDownloads={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
