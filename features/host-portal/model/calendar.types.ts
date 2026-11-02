export type CalendarView = "month" | "week" | "list";

export type CalendarEvent = {
  id: string;
  /** Local date, "YYYY-MM-DD". */
  date: string;
  /** "Photowalk 16:00" */
  title: string;
  /** "6 of 8 guests" */
  note: string | null;
  kind: "booked" | "sold-out";
  /** Guests expected, for the footer total. */
  guests: number;
};

/** One square of the grid. `date` is null for the blank squares around the month. */
export type CalendarCell = { date: string | null; day: number | null };
