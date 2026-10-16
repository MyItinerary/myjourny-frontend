import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { mockTodayReminderEmail } from "./test-fixtures";
import { TodayReminderEmailView } from "./today-reminder-email-view";

describe("TodayReminderEmailView", () => {
  it("renders today title, time, meeting point, check-in code and map", () => {
    renderWithProviders(<TodayReminderEmailView data={mockTodayReminderEmail} />);

    expect(screen.getByText("TODAY")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Today: Sunrise Kayaking, 6:00am" }),
    ).toBeInTheDocument();
    expect(screen.getByText(mockTodayReminderEmail.timeAndDuration)).toBeInTheDocument();
    expect(screen.getByText(mockTodayReminderEmail.checkInCode)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Directions and check-in" }),
    ).toHaveAttribute("href", mockTodayReminderEmail.directionsUrl);
    expect(screen.getByText("Tarkwa Bay, Lagos state")).toBeInTheDocument();
  });

  it("renders host and inclusions", () => {
    renderWithProviders(<TodayReminderEmailView data={mockTodayReminderEmail} />);

    expect(
      screen.getByText(`Hosted by ${mockTodayReminderEmail.host.name}`),
    ).toBeInTheDocument();
    expect(screen.getByText(mockTodayReminderEmail.whatsappNote)).toBeInTheDocument();
  });
});
