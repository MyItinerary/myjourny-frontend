import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { CalendarCellModel, HostCalendarViewModel } from "../view-model/use-host-calendar-view-model";
import { HostCalendarView } from "./host-calendar-view";

const cell = (over: Partial<CalendarCellModel> = {}): CalendarCellModel => ({
  date: "2026-09-20",
  day: 20,
  past: false,
  today: false,
  blocked: false,
  dragging: false,
  tone: "none",
  events: [],
  label: "Sunday 20 September",
  ...over,
});

const vm = (over: Partial<HostCalendarViewModel> = {}): HostCalendarViewModel => ({
  ready: true,
  header: { title: "Calendar", subtitle: "", actions: [] },
  view: "month",
  views: [
    { key: "month", label: "Month" },
    { key: "week", label: "Week" },
    { key: "list", label: "List" },
  ],
  onView: vi.fn(),
  title: "September 2026",
  onPrev: vi.fn(),
  onNext: vi.fn(),
  weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  cells: [
    { ...cell({ date: null, day: null, label: "" }) },
    cell({ date: "2026-09-19", day: 19, today: true, label: "Saturday 19 September" }),
    cell({
      tone: "booked",
      events: [{ id: "e1", date: "2026-09-20", title: "Photowalk 16:00", note: "6 of 8 guests", kind: "booked", guests: 6 }],
      label: "Sunday 20 September, 1 event",
    }),
    cell({
      date: "2026-09-21",
      day: 21,
      tone: "sold-out",
      events: [{ id: "e2", date: "2026-09-21", title: "Boat morning", note: null, kind: "sold-out", guests: 5 }],
      label: "Monday 21 September, 1 event",
    }),
    cell({ date: "2026-09-30", day: 30, blocked: true, label: "Wednesday 30 September, blocked" }),
    cell({ date: "2026-09-10", day: 10, past: true, label: "Thursday 10 September" }),
  ],
  listRows: [],
  totals: "2 dates with guests · 11 guests expected · 1 blocked",
  onCellDown: vi.fn(),
  onCellEnter: vi.fn(),
  onCellUp: vi.fn(),
  onCellKey: vi.fn(),
  onEndDrag: vi.fn(),
  onOpenDay: vi.fn(),
  panel: null,
  onClosePanel: vi.fn(),
  onToggleBlock: vi.fn(),
  ...over,
});

describe("HostCalendarView, the month", () => {
  it("shows the weekdays, the dates, what's booked, and the legend and totals", () => {
    renderWithProviders(<HostCalendarView vm={vm()} />);

    expect(screen.getByText("September 2026")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Photowalk 16:00")).toHaveClass("bg-[#F5032D]");
    expect(screen.getByText("6 of 8 guests")).toBeInTheDocument();
    expect(screen.getByText("Boat morning")).toHaveClass("bg-[#3086FF]");
    for (const label of ["Booked", "Sold out", "Blocked"]) expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText("2 dates with guests · 11 guests expected · 1 blocked")).toBeInTheDocument();
    expect(screen.getByText(/Press and drag across dates to block a stretch of them/)).toBeInTheDocument();
  });

  it("marks today in red, past dates grey, and blocked dates striped", () => {
    renderWithProviders(<HostCalendarView vm={vm()} />);

    expect(screen.getByText("19")).toHaveClass("text-[#F5032D]");
    expect(screen.getByText("10")).toHaveClass("text-[#BDBDBD]");
    expect(screen.getByRole("button", { name: "Wednesday 30 September, blocked" }).className).toContain("repeating-linear-gradient");
    expect(screen.getByRole("button", { name: "Monday 21 September, 1 event" })).toHaveClass("bg-[#F6FAFF]");
  });

  it("leaves blank squares around the month and highlights a drag", () => {
    renderWithProviders(<HostCalendarView vm={vm({ cells: [cell({ date: null, day: null, label: "" }), cell({ dragging: true })] })} />);
    expect(screen.getAllByRole("button", { name: /Sunday 20 September/ })[0]).toHaveClass("bg-[#FDF7EB]");
  });

  it("reports pressing, dragging over, and letting go of dates", () => {
    const props = vm();
    renderWithProviders(<HostCalendarView vm={props} />);
    const date = screen.getByRole("button", { name: "Sunday 20 September, 1 event" });

    fireEvent.mouseDown(date);
    fireEvent.mouseEnter(date);
    fireEvent.mouseUp(date);

    expect(props.onCellDown).toHaveBeenCalledWith("2026-09-20");
    expect(props.onCellEnter).toHaveBeenCalledWith("2026-09-20");
    expect(props.onCellUp).toHaveBeenCalledWith("2026-09-20");
  });

  it("opens a date from the keyboard", () => {
    const props = vm();
    renderWithProviders(<HostCalendarView vm={props} />);
    const date = screen.getByRole("button", { name: "Sunday 20 September, 1 event" });

    fireEvent.keyDown(date, { key: "Enter" });
    fireEvent.keyDown(date, { key: " " });
    fireEvent.keyDown(date, { key: "a" });

    expect(props.onCellKey).toHaveBeenCalledTimes(2);
  });

  it("ends a drag that's let go anywhere on the grid", () => {
    const props = vm();
    const { container } = renderWithProviders(<HostCalendarView vm={props} />);
    const grid = container.querySelector(".grid-cols-7:last-of-type")!;

    fireEvent.mouseUp(grid);
    fireEvent.mouseLeave(grid);

    expect(props.onEndDrag).toHaveBeenCalledTimes(2);
  });
});

describe("HostCalendarView, the toolbar", () => {
  it("switches view and moves forward and back", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostCalendarView vm={props} />);

    expect(screen.getByRole("tab", { name: "Month" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: "Week" }));
    expect(props.onView).toHaveBeenCalledWith("week");
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(props.onPrev).toHaveBeenCalled();
    expect(props.onNext).toHaveBeenCalled();
  });

  it("labels the arrows for weeks in the week view", () => {
    renderWithProviders(<HostCalendarView vm={vm({ view: "week", title: "14 – 20 September 2026" })} />);
    expect(screen.getByRole("button", { name: "Previous week" })).toBeInTheDocument();
    expect(screen.getByText("14 – 20 September 2026")).toBeInTheDocument();
  });
});

describe("HostCalendarView, the list", () => {
  it("lists dates with guests or blocked, and opens one", async () => {
    const props = vm({
      view: "list",
      listRows: [
        { date: "2026-09-20", title: "Sun 20 Sept", blocked: false, events: [{ id: "e1", date: "2026-09-20", title: "Photowalk 16:00", note: "6 of 8 guests", kind: "booked", guests: 6 }] },
        { date: "2026-09-30", title: "Wed 30 Sept", blocked: true, events: [] },
      ],
    });
    const { user } = renderWithProviders(<HostCalendarView vm={props} />);

    expect(screen.getByText("Photowalk 16:00")).toBeInTheDocument();
    expect(screen.getByText("Blocked", { selector: "span.text-\\[13px\\]" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Sun 20 Sept/ }));
    expect(props.onOpenDay).toHaveBeenCalledWith("2026-09-20");
  });

  it("says when there's nothing to list", () => {
    renderWithProviders(<HostCalendarView vm={vm({ view: "list", listRows: [] })} />);
    expect(screen.getByText("Nothing booked or blocked in this stretch.")).toBeInTheDocument();
  });
});

describe("HostCalendarView, before today is known", () => {
  it("shows an empty frame", () => {
    renderWithProviders(<HostCalendarView vm={vm({ ready: false })} />);
    expect(screen.queryByText("September 2026")).not.toBeInTheDocument();
  });
});
