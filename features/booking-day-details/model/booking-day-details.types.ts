/** The parts of a booking the day-of section reads (itin's BookingOut). */
export type BookingDayDetailsSource = {
  meeting_point?: {
    latitude?: number | null;
    longitude?: number | null;
    instructions?: string | null;
    city?: string | null;
    country?: string | null;
  } | null;
  what_to_bring?: string | null;
  host_phone?: string | null;
  receipt_url?: string | null;
  calendar_url?: string | null;
};

/** What the booking page shows about the day itself. Empty fields are hidden. */
export type BookingDayDetails = {
  meetingInstructions: string | null;
  /** City and country of the meeting point, e.g. "Lagos, Nigeria". */
  meetingArea: string | null;
  mapsUrl: string | null;
  whatToBring: string | null;
  hostPhone: string | null;
  hostPhoneHref: string | null;
  calendarUrl: string | null;
  receiptUrl: string | null;
};
