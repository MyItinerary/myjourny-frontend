import type { BookingBarProps } from "../model/booking-card.types";
import type { BookingPanelViewModel } from "./use-booking-panel-view-model";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

/** "Sat 12 Sept". */
export function shortDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** The collapsed mobile bar for an experience: the price, the date and time
 * picked, and the seats left when it's few. */
export function toExperienceBookingBar({ card, sessions }: Pick<BookingPanelViewModel, "card" | "sessions">): BookingBarProps {
  const { headline } = card;
  const summary = `${headline.showFrom ? "From " : ""}${headline.amount} ${headline.unit}`;
  if (sessions.noSessions || (sessions.allSoldOut && sessions.options.length === 0)) {
    return { summary: sessions.noSessions ? "No upcoming sessions" : "Sold out", actionLabel: "Book now", actionDisabled: true };
  }
  const picked = sessions.options.find((option) => option.selected);
  const time = picked ? picked.label.replace(/\s+/g, "").toLowerCase() : null;
  const detail = [sessions.selectedDate ? shortDate(sessions.selectedDate) : null, time].filter(Boolean).join(" · ");
  const left = picked?.note?.match(/^(\d+) left$/)?.[1];
  return {
    summary,
    detail: detail || null,
    urgency: left ? `${left} ${left === "1" ? "spot" : "spots"} left at ${time}` : null,
    actionLabel: card.button.label ?? "Book now",
  };
}
