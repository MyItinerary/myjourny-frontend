export type BookingConfirmation = {
  title: string;
  imageUrl: string | null;
  dateLabel: string;
  guestsLabel: string;
  /** "₦5,000.00", or "Free" when nothing was charged. */
  totalLabel: string | null;
  /** The large line under the guests: "₦5,000.00 total", or "Free". */
  totalHeadline: string | null;
  viewHref: string;
  calendarHref: string | null;
};
