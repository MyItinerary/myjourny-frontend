import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  addDays,
  datesBetween,
  longDate,
  monthCells,
  monthTitle,
  parseKey,
  shortDate,
  totalsFor,
  totalsLine,
  weekCells,
  weekStart,
  weekTitle,
  dateKey,
} from "../model/calendar";
import { useHostCalendar } from "../model/calendar-data";
import type { CalendarEvent, CalendarView } from "../model/calendar.types";
import { HOST_PORTAL_BASE } from "../model/nav";
import type { HostPageHeader } from "./use-host-home-view-model";
import { useToday } from "./use-today";

export type CalendarCellModel = {
  date: string | null;
  day: number | null;
  past: boolean;
  today: boolean;
  blocked: boolean;
  /** Part of the stretch being dragged to block. */
  dragging: boolean;
  tone: "sold-out" | "booked" | "none";
  events: CalendarEvent[];
  /** "Saturday 19 September, 2 events", for assistive tech. */
  label: string;
};

export type CalendarListRow = { date: string; title: string; events: CalendarEvent[]; blocked: boolean };

export type DayPanel = {
  title: string;
  subtitle: string | null;
  events: { id: string; title: string; note: string | null; guestListHref: string; scanHref: string }[];
  blocked: boolean;
  blockLabel: string;
  /** True when it's before today: nothing to block. */
  past: boolean;
};

export type HostCalendarViewModel = {
  /** False until the date is known on the client. */
  ready: boolean;
  header: HostPageHeader;
  view: CalendarView;
  views: { key: CalendarView; label: string }[];
  onView: (view: CalendarView) => void;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  weekdays: string[];
  cells: CalendarCellModel[];
  listRows: CalendarListRow[];
  totals: string;
  onCellDown: (date: string) => void;
  onCellEnter: (date: string) => void;
  onCellUp: (date: string) => void;
  onCellKey: (date: string) => void;
  onEndDrag: () => void;
  onOpenDay: (date: string) => void;
  panel: DayPanel | null;
  onClosePanel: () => void;
  onToggleBlock: () => void;
};

const VIEWS: { key: CalendarView; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "list", label: "List" },
];

const HINT = "Click a date, or press and drag across dates, to block them.";

export function useHostCalendarViewModel(): HostCalendarViewModel {
  const preview = useSearchParams().get("preview");
  const today = useToday();
  const { events, initialBlocked } = useHostCalendar(preview, today);

  const [view, setView] = useState<CalendarView>("month");
  const [anchorState, setAnchor] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  // Starts as the sample's blocked dates in the preview; nothing else is saved yet.
  const [blockedState, setBlocked] = useState<string[] | null>(null);
  const [drag, setDrag] = useState<{ from: string; to: string } | null>(null);

  const anchor = anchorState ?? today;
  const blocked = blockedState ?? initialBlocked;

  if (!today || !anchor) {
    return emptyModel();
  }

  const base = parseKey(anchor);
  const year = base.getFullYear();
  const month = base.getMonth();
  const eventsOn = (date: string) => events.filter((e) => e.date === date);

  const cellsRaw = view === "week" ? weekCells(weekStart(anchor)) : monthCells(year, month);
  const shownDates = cellsRaw.flatMap((c) => (c.date ? [c.date] : []));
  const inView = events.filter((e) => shownDates.includes(e.date));
  const blockedInView = blocked.filter((d) => shownDates.includes(d));
  const range = drag ? datesBetween(drag.from, drag.to) : [];

  const cells: CalendarCellModel[] = cellsRaw.map((cell) => {
    const evs = cell.date ? eventsOn(cell.date) : [];
    const isBlocked = !!cell.date && blocked.includes(cell.date);
    return {
      ...cell,
      past: !!cell.date && cell.date < today,
      today: cell.date === today,
      blocked: isBlocked,
      dragging: !!cell.date && range.includes(cell.date),
      tone: evs.some((e) => e.kind === "sold-out") ? "sold-out" : evs.length ? "booked" : "none",
      events: evs,
      label: cell.date
        ? `${longDate(cell.date)}${isBlocked ? ", blocked" : ""}${evs.length ? `, ${evs.length} ${evs.length === 1 ? "event" : "events"}` : ""}`
        : "",
    };
  });

  const listDates = [...new Set([...inView.map((e) => e.date), ...blockedInView])].sort();
  const listRows: CalendarListRow[] = listDates.map((date) => ({
    date,
    title: shortDate(date),
    events: eventsOn(date),
    blocked: blocked.includes(date),
  }));

  const bookedDates = new Set(inView.map((e) => e.date)).size;
  const title = view === "week" ? weekTitle(weekStart(anchor)) : monthTitle(year, month);
  const step = (dir: 1 | -1) => setAnchor(view === "week" ? addDays(anchor, 7 * dir) : dateKey(new Date(year, month + dir, 1)));

  const open = (date: string) => setDay(date);
  const block = (dates: string[]) => setBlocked((cur) => [...(cur ?? initialBlocked), ...dates.filter((d) => !(cur ?? initialBlocked).includes(d))]);

  const panel: DayPanel | null = day
    ? (() => {
        const evs = eventsOn(day);
        const isBlocked = blocked.includes(day);
        return {
          title: longDate(day),
          subtitle: isBlocked
            ? "Blocked. Nobody new can book this date."
            : evs.length
              ? `${evs.length} ${evs.length === 1 ? "experience runs" : "experiences run"} on this date`
              : null,
          events: evs.map((e) => ({
            id: e.id,
            title: e.title,
            note: e.note,
            guestListHref: `${HOST_PORTAL_BASE}/bookings`,
            scanHref: `${HOST_PORTAL_BASE}/bookings/scan`,
          })),
          blocked: isBlocked,
          blockLabel: isBlocked ? "Open this date again" : "Block this date",
          past: day < today,
        };
      })()
    : null;

  return {
    ready: true,
    header: {
      title: "Calendar",
      subtitle: `${monthTitle(year, month)} · ${bookedDates} ${bookedDates === 1 ? "date" : "dates"} booked`,
      actions: [{ label: "Block dates", onClick: () => toast.info(HINT), primary: false }],
    },
    view,
    views: VIEWS,
    onView: setView,
    title,
    onPrev: () => step(-1),
    onNext: () => step(1),
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    cells,
    listRows,
    totals: totalsLine(totalsFor(inView, blockedInView)),
    onCellDown: (date) => setDrag({ from: date, to: date }),
    onCellEnter: (date) => setDrag((cur) => (cur ? { ...cur, to: date } : cur)),
    onCellUp: (date) => {
      if (drag && drag.from !== date) {
        block(datesBetween(drag.from, date).filter((d) => d >= today));
        setDrag(null);
      } else {
        setDrag(null);
        open(date);
      }
    },
    onCellKey: open,
    onEndDrag: () => setDrag(null),
    onOpenDay: open,
    panel,
    onClosePanel: () => setDay(null),
    onToggleBlock: () => {
      if (!day) return;
      if (day < today && !blocked.includes(day)) return;
      if (blocked.includes(day)) setBlocked(blocked.filter((d) => d !== day));
      else block([day]);
    },
  };
}

function emptyModel(): HostCalendarViewModel {
  const noop = () => {};
  return {
    ready: false,
    header: { title: "Calendar", subtitle: "", actions: [] },
    view: "month",
    views: VIEWS,
    onView: noop,
    title: "",
    onPrev: noop,
    onNext: noop,
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    cells: [],
    listRows: [],
    totals: "",
    onCellDown: noop,
    onCellEnter: noop,
    onCellUp: noop,
    onCellKey: noop,
    onEndDrag: noop,
    onOpenDay: noop,
    panel: null,
    onClosePanel: noop,
    onToggleBlock: noop,
  };
}
