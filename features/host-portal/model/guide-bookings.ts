import { shortDate } from "./calendar";
import type { BookingStatusLabel, BookingTab, BookingWhen, HostBooking } from "./bookings.types";
import type { GuideBooking } from "./guide-bookings.types";
import { formatNaira } from "./money";

const amount = (value?: string | number | null) => (value == null || value === "" ? 0 : Number(value));

/** The reference guests see on their booking and emails: the first 8 of its id. */
export const bookingRef = (id: string) => id.replace(/-/g, "").slice(0, 8).toUpperCase();

/** Bookings the guide should see: paid for, so not abandoned checkouts. */
export const isPaid = (b: GuideBooking) => b.payment_status !== "unpaid";

function tabOf(b: GuideBooking): BookingTab {
  if (b.status === "completed") return "Completed";
  if (b.status === "cancelled" || b.status === "refunded" || b.status === "expired") return "Cancelled";
  return "Upcoming";
}

function statusOf(b: GuideBooking, tab: BookingTab): BookingStatusLabel {
  if (tab === "Cancelled") return b.cancelled_by === "guest" ? "Cancelled by guest" : "Cancelled";
  if (tab === "Completed") return b.payout_status === "paid" ? "Paid out" : "Completed";
  return "Confirmed";
}

function whenOf(date: string, today: string): BookingWhen {
  if (!date) return "later";
  if (date < today) return "past";
  if (date === today) return "today";
  const tomorrow = new Date(`${today}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return date === tomorrow.toISOString().slice(0, 10) ? "tomorrow" : "later";
}

const places = (n: number) => `${n} ${n === 1 ? "place" : "places"}`;

/** "2 × Adult, 1 × Child", or "" with a single ticket type. */
function ticketLine(b: GuideBooking): string {
  const items = (b.line_items ?? []).filter((item) => item.quantity > 0);
  return items.length > 1 ? items.map((item) => `${item.quantity} × ${item.label}`).join(", ") : "";
}

function contactOf(b: GuideBooking, tab: BookingTab): string {
  if (tab !== "Upcoming") return "Only shown while a booking is confirmed.";
  if (b.guest?.phone) return b.guest.phone;
  return "They haven't added a verified phone number. Message them through MyJourny support if you need to reach them.";
}

/** One of itin's bookings in the shape the Bookings table and panel show.
 * `today` is YYYY-MM-DD. */
export function toHostBooking(b: GuideBooking, today: string): HostBooking {
  const date = b.requested_datetime?.slice(0, 10) ?? "";
  const time = b.requested_datetime?.slice(11, 16) ?? "";
  const tab = tabOf(b);
  const status = statusOf(b, tab);
  const listing = b.experience_title ?? "Listing";
  const guests = b.party_size ?? 0;
  const gross = amount(b.price_total);
  const net = amount(b.guide_earnings_amount);
  const refunded = amount(b.refunded_amount);
  const dateLabel = date ? shortDate(date) : "Date to be set";
  return {
    id: b.id,
    ref: bookingRef(b.id),
    tab,
    when: whenOf(date, today),
    listing,
    date: dateLabel,
    name: b.guest?.name?.trim() || "Guest",
    avatarUrl: b.guest?.avatar_url ?? null,
    rowNote: ticketLine(b),
    line: `${listing} · ${dateLabel}${time ? `, ${time}` : ""}`,
    money: `${places(guests)} · ${formatNaira(gross)}`,
    guests,
    gross: formatNaira(gross),
    net: formatNaira(net),
    status,
    isRequest: false,
    deadline: null,
    notes: "",
    contact: contactOf(b, tab),
    facts: [
      { label: "Guests", value: String(guests) },
      { label: "They paid", value: formatNaira(gross) },
      { label: "Our share", value: formatNaira(Math.max(gross - net, 0)) },
      { label: tab === "Upcoming" ? "You receive" : "You received", value: formatNaira(tab === "Cancelled" ? 0 : net) },
    ],
    timeline:
      tab === "Cancelled"
        ? [
            { title: "Booked", body: `${places(guests)} for ${formatNaira(gross)}.` },
            {
              title: status,
              body: refunded > 0 ? `${formatNaira(refunded)} went back to the guest.` : "Any refund is handled by MyJourny.",
            },
          ]
        : [],
    cancelNote: null,
  };
}
