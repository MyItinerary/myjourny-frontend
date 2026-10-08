import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { SessionChoice } from "../view-model/use-session-choice";
import { SessionDateView, SessionTimesView } from "./session-picker-view";

function sessionChoice(overrides: Partial<SessionChoice> = {}): SessionChoice {
  return {
    scheduled: true,
    timezoneNote: "Times are Lagos time.",
    noSessions: false,
    allSoldOut: false,
    options: [
      { startsAt: "a", label: "9:00 AM", note: "2 left", disabled: false, selected: true },
      { startsAt: "b", label: "3:00 PM", note: "Sold out", disabled: true, selected: false },
    ],
    session: null,
    request: { requested_datetime: "a" },
    lengthDays: 1,
    selectedDate: new Date(2030, 5, 1),
    dateLabel: "June 1",
    minDate: new Date(2030, 0, 1),
    isDateSelectable: () => true,
    onSelectDate: vi.fn(),
    onPickSession: vi.fn(),
    ...overrides,
  };
}

describe("SessionTimesView", () => {
  it("lists the day's session times and picks one", async () => {
    const choice = sessionChoice();
    const { user } = renderWithProviders(<SessionTimesView {...choice} />);

    expect(screen.getByRole("button", { name: /9:00 AM/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /3:00 PM/ })).toBeDisabled();
    expect(screen.getByText("Sold out")).toBeInTheDocument();
    expect(screen.getByText("Times are Lagos time.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /9:00 AM/ }));

    expect(choice.onPickSession).toHaveBeenCalledWith("a");
  });

  it("says when nothing is scheduled yet", () => {
    renderWithProviders(<SessionTimesView {...sessionChoice({ noSessions: true })} />);
    expect(screen.getByText(/No upcoming sessions yet/)).toBeInTheDocument();
  });

  it("says when every session is full", () => {
    renderWithProviders(<SessionTimesView {...sessionChoice({ allSoldOut: true, options: [] })} />);
    expect(screen.getByText("All upcoming sessions are sold out.")).toBeInTheDocument();
  });

  it("asks only for a date when there's no schedule", () => {
    renderWithProviders(<SessionTimesView {...sessionChoice({ scheduled: false, options: [] })} />);
    expect(screen.getByText(/The host will confirm the start time/)).toBeInTheDocument();
  });
});

describe("SessionDateView", () => {
  it("opens the calendar and picks a day", async () => {
    const choice = sessionChoice({ selectedDate: new Date(), minDate: new Date(2000, 0, 1) });
    const { user } = renderWithProviders(<SessionDateView {...choice} />);

    await user.click(screen.getByRole("button", { name: /June 1/ }));
    await user.click(screen.getByRole("button", { name: "Today" }));

    expect(choice.onSelectDate).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /June 1/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when clicking outside", async () => {
    const { user } = renderWithProviders(
      <div>
        <SessionDateView {...sessionChoice()} />
        <p>outside</p>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: /June 1/ }));
    await user.click(screen.getByText("outside"));
    expect(screen.getByRole("button", { name: /June 1/ })).toHaveAttribute("aria-expanded", "false");
  });
});
