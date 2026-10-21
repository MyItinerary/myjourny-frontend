import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { DayPanel } from "../view-model/use-host-calendar-view-model";
import { CalendarDayPanelView } from "./host-calendar-day-panel-view";

const panel = (over: Partial<DayPanel> = {}): DayPanel => ({
  title: "Sunday 20 September",
  subtitle: "1 experience runs on this date",
  events: [
    { id: "e1", title: "Photowalk 16:00", note: "6 of 8 guests", guestListHref: "/host/dashboard/bookings", scanHref: "/host/dashboard/bookings/scan" },
  ],
  blocked: false,
  blockLabel: "Block this date",
  past: false,
  ...over,
});

describe("CalendarDayPanelView", () => {
  it("renders nothing while closed", () => {
    renderWithProviders(<CalendarDayPanelView panel={null} onClose={vi.fn()} onToggleBlock={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the date, what runs on it and the guest-list and scan links", async () => {
    renderWithProviders(<CalendarDayPanelView panel={panel()} onClose={vi.fn()} onToggleBlock={vi.fn()} />);

    expect(await screen.findByText("Sunday 20 September")).toBeInTheDocument();
    expect(screen.getByText("1 experience runs on this date")).toBeInTheDocument();
    expect(screen.getByText("Photowalk 16:00")).toBeInTheDocument();
    expect(screen.getByText("6 of 8 guests")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See the guest list" })).toHaveAttribute("href", "/host/dashboard/bookings");
    expect(screen.getByRole("link", { name: "Scan tickets" })).toHaveAttribute("href", "/host/dashboard/bookings/scan");
    expect(screen.getByRole("link", { name: "Scan tickets" })).toHaveClass("lg:hidden");
    expect(screen.getByText(/only stops new bookings/)).toBeInTheDocument();
  });

  it("says when nobody has booked", async () => {
    renderWithProviders(<CalendarDayPanelView panel={panel({ events: [], subtitle: null })} onClose={vi.fn()} onToggleBlock={vi.fn()} />);
    expect(await screen.findByText(/Nobody has booked this date/)).toBeInTheDocument();
  });

  it("blocks or reopens the date, and closes", async () => {
    const onClose = vi.fn();
    const onToggleBlock = vi.fn();
    const { user } = renderWithProviders(<CalendarDayPanelView panel={panel()} onClose={onClose} onToggleBlock={onToggleBlock} />);

    await user.click(await screen.findByRole("button", { name: "Block this date" }));
    expect(onToggleBlock).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("won't block a date that has passed, but can still reopen one", async () => {
    const { rerender } = renderWithProviders(
      <CalendarDayPanelView panel={panel({ past: true })} onClose={vi.fn()} onToggleBlock={vi.fn()} />,
    );
    expect(await screen.findByRole("button", { name: "Block this date" })).toBeDisabled();

    rerender(
      <CalendarDayPanelView panel={panel({ past: true, blocked: true, blockLabel: "Open this date again" })} onClose={vi.fn()} onToggleBlock={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Open this date again" })).toBeEnabled();
  });
});
