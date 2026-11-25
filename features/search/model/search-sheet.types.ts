/** A piece of a suggestion's title; `match` pieces are the typed letters, shown bold. */
export interface TextSegment {
  text: string;
  match: boolean;
}

export type DatePresetId = "tonight" | "weekend" | "next-week" | "anytime";

export interface DatePreset {
  id: DatePresetId;
  label: string;
  /** Null for Anytime, which clears the dates. */
  range: { start: Date; end: Date } | null;
}

export type CalendarDayState = "past" | "today" | "default";

export interface CalendarDay {
  date: Date;
  day: number;
  state: CalendarDayState;
  /** An ink circle: the range's first or last day. */
  selected: boolean;
  /** Where the grey band between the two ends sits on this day. */
  band: "none" | "start" | "middle" | "end";
}

export interface CalendarMonth {
  key: string;
  label: string;
  /** Empty cells before the 1st, so the grid starts on Monday. */
  leadingBlanks: number;
  days: CalendarDay[];
}
