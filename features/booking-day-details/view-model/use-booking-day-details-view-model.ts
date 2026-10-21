import { useMemo } from "react";

import { hasMeetingDetails, toBookingDayDetails } from "../model/booking-day-details";
import type { BookingDayDetails, BookingDayDetailsSource } from "../model/booking-day-details.types";

export type BookingDayDetailsViewModel = {
  details: BookingDayDetails;
  /** Meeting point, what to bring or the host's number: shown once confirmed. */
  showMeeting: boolean;
  showDownloads: boolean;
};

/** The day-of part of a booking page: where to meet, what to bring, who to
 * call, and the calendar and receipt downloads. */
export function useBookingDayDetailsViewModel(booking: BookingDayDetailsSource): BookingDayDetailsViewModel {
  const details = useMemo(() => toBookingDayDetails(booking), [booking]);
  return {
    details,
    showMeeting: hasMeetingDetails(details),
    showDownloads: Boolean(details.calendarUrl || details.receiptUrl),
  };
}
