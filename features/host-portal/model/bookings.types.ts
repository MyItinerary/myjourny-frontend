export type BookingTab = "Requests" | "Upcoming" | "Completed" | "Cancelled";

/** How the table words where a booking is in its life. */
export type BookingStatusLabel = "Waiting on you" | "Confirmed" | "Paid out" | "Cancelled by guest";

export type BookingWhen = "today" | "tomorrow" | "later" | "past";

export type HostBooking = {
  id: string;
  /** "MJ-4502" */
  ref: string;
  tab: BookingTab;
  /** Where the experience's date sits relative to today. */
  when: BookingWhen;
  listing: string;
  /** "Sat 20 Sept" */
  date: string;
  name: string;
  avatarUrl: string | null;
  /** A line under the name in the table: "Nut allergy". */
  rowNote: string;
  /** "Photowalk · Sat 20 Sept, 16:00" */
  line: string;
  /** "2 places · ₦20,000" */
  money: string;
  guests: number;
  /** What they pay and what the host receives, formatted. */
  gross: string;
  net: string;
  status: BookingStatusLabel;
  isRequest: boolean;
  /** "You have 2 hours to answer this", for requests. */
  deadline: string | null;
  notes: string;
  contact: string;
  facts: { label: string; value: string }[];
  timeline: { title: string; body: string }[];
  cancelNote: string | null;
};

export type BookingFilters = {
  q: string;
  status: BookingTab | "All";
  listing: string;
  when: BookingWhenFilter;
};

export type BookingWhenFilter = "All dates" | "Today" | "Tomorrow" | "Still to come" | "Already run";
