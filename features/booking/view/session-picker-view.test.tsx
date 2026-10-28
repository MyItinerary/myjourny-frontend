import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { SessionChoice } from "../view-model/use-session-choice";
import { SessionDateView, SessionTimesView } from "./session-picker-view";

function sessionChoice(overrides: Partial<SessionChoice> = {}): SessionChoice {
  return {
    loading: false,
    scheduled: true,
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
    fieldLabel: "Sat 1 June",
    endDate: null,
    dayState: () => "open",
    dayStatus: "ok",
    nextOpen: { label: "Sat 8 June", shortLabel: "8 June" },
    onJumpToNext: vi.fn(),
    urgency: null,
    singleTime: false,
    timezoneNote: "Times are Lagos time.",
    ...overrides,
  };
}

describe("SessionTimesView", () => {
  it("lists the day's times, greys out a full one, and picks one", async () => {
    const choice = sessionChoice();
    const { user } = renderWithProviders(<SessionTimesView sessions={choice} />);

    expect(screen.getByText("Choose a time")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "9:00 AM" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "3:00 PM" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "9:00 AM" }));

    expect(choice.onPickSession).toHaveBeenCalledWith("a");
  });

  it("shows no time picker when the day has just the one time", () => {
    renderWithProviders(
      <SessionTimesView sessions={sessionChoice({ singleTime: true, options: [{ startsAt: "a", label: "9:00 AM", note: null, disabled: false, selected: true }] })} />,
    );
    expect(screen.queryByText("Choose a time")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "9:00 AM" })).not.toBeInTheDocument();
    // The time is in the date field; the zone is still said.
    expect(screen.getByText("Times are Lagos time.")).toBeInTheDocument();
  });

  it("says which zone the times are in", () => {
    renderWithProviders(<SessionTimesView sessions={sessionChoice()} />);
    expect(screen.getByText("Times are Lagos time.")).toBeInTheDocument();
  });

  it("holds the space with skeleton chips while times load", () => {
    renderWithProviders(<SessionTimesView sessions={sessionChoice({ loading: true, options: [] })} />);
    expect(screen.getByLabelText("Loading times")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("names an empty day and offers the nearest one", async () => {
    const choice = sessionChoice({ dayStatus: "empty", options: [] });
    const { user } = renderWithProviders(<SessionTimesView sessions={choice} />);

    expect(screen.getByText(/No times on this day/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try 8 June" }));
    expect(choice.onJumpToNext).toHaveBeenCalled();
  });

  it("freezes the chips while a booking starts", () => {
    renderWithProviders(<SessionTimesView sessions={sessionChoice()} locked />);
    expect(screen.getByRole("button", { name: "9:00 AM" })).toBeDisabled();
  });

  it("says when nothing is scheduled yet", () => {
    renderWithProviders(<SessionTimesView sessions={sessionChoice({ noSessions: true })} />);
    expect(screen.getByText(/No upcoming sessions yet/)).toBeInTheDocument();
  });

  it("says when every session is full", () => {
    renderWithProviders(<SessionTimesView sessions={sessionChoice({ allSoldOut: true, options: [] })} />);
    expect(screen.getByText("All upcoming sessions are sold out.")).toBeInTheDocument();
  });

  it("shows no times and no helper text when there's no schedule", () => {
    renderWithProviders(<SessionTimesView sessions={sessionChoice({ scheduled: false, options: [] })} />);
    expect(screen.queryByText("Choose a time")).not.toBeInTheDocument();
    expect(screen.queryByText(/host will confirm/i)).not.toBeInTheDocument();
  });
});

describe("SessionDateView", () => {
  it("shows the date and opens and closes the calendar", async () => {
    const onOpenChange = vi.fn();
    const { user } = renderWithProviders(
      <SessionDateView sessions={sessionChoice()} label="Sat 1 June · 3 hours" open={false} onOpenChange={onOpenChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Date: Sat 1 June · 3 hours" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("picks a day from the open calendar and closes it", async () => {
    const choice = sessionChoice({ selectedDate: new Date(), minDate: new Date(2000, 0, 1) });
    const onOpenChange = vi.fn();
    const { user } = renderWithProviders(
      <SessionDateView sessions={choice} label="Today" open onOpenChange={onOpenChange} />,
    );

    expect(screen.getByRole("button", { name: /^Date:/ })).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Today" }));

    expect(choice.onSelectDate).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes when clicking outside", async () => {
    const onOpenChange = vi.fn();
    const { user } = renderWithProviders(
      <div>
        <SessionDateView sessions={sessionChoice()} label="Sat 1 June" open onOpenChange={onOpenChange} />
        <p>outside</p>
      </div>,
    );
    await user.click(screen.getByText("outside"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("can't be opened while locked", () => {
    renderWithProviders(<SessionDateView sessions={sessionChoice()} label="Sat 1 June" locked open={false} onOpenChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /^Date:/ })).toBeDisabled();
  });
});
