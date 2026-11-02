import { addDays, shortDate } from "./calendar";
import type { BookingWhen, HostBooking } from "./bookings.types";
import { formatNaira } from "./money";

const PHOTOWALK = "Lagos Island Photowalk";
const PORTRAITS = "Freedom Park Portraits";

function whenFor(days: number): BookingWhen {
  return days < 0 ? "past" : days === 0 ? "today" : days === 1 ? "tomorrow" : "later";
}

// Six bookings across every state, as drawn in the design, with dates placed
// relative to today so "Tomorrow" and "Still to come" always have something.
// Used only for the `?preview=full` view while itin has no host API.
export function sampleBookings(today: string): HostBooking[] {
  const day = (offset: number) => shortDate(addDays(today, offset));
  const facts = (guests: number, paid: number, commission: number, received: boolean, refunded = false) => [
    { label: "Guests", value: String(guests) },
    { label: refunded ? "Refunded" : received ? "They paid" : "They paid", value: formatNaira(paid) },
    { label: "Your commission", value: formatNaira(commission) },
    { label: refunded || received ? "You received" : "You receive", value: formatNaira(paid - commission) },
  ];
  const base = { avatarUrl: null, timeline: [], cancelNote: null, deadline: null, isRequest: false };

  return [
    {
      ...base,
      id: "b1", ref: "MJ-4502", tab: "Requests", when: whenFor(1), listing: PHOTOWALK, date: day(1), name: "Amaka Eze",
      rowNote: "Nut allergy", line: `Photowalk · ${day(1)}, 16:00`, money: "2 places · ₦20,000", guests: 2, gross: "₦20,000", net: "₦17,000",
      status: "Waiting on you", isRequest: true, deadline: "You have 2 hours to answer this",
      notes: "Nut allergy, so no groundnut at the drinks stop. Walks fine.",
      contact: "You will see it 24 hours before, so tomorrow at 16:00.",
      facts: [
        { label: "Guests", value: "2" },
        { label: "They pay", value: "₦20,000" },
        { label: "Your commission", value: "₦3,000" },
        { label: "You receive", value: "₦17,000" },
      ],
    },
    {
      ...base,
      id: "b2", ref: "MJ-4510", tab: "Requests", when: whenFor(8), listing: PHOTOWALK, date: day(8), name: "Chidi Okafor",
      rowNote: "Asking about a 14 year old", line: `Photowalk · ${day(8)}, 16:00`, money: "3 places · ₦30,000", guests: 3, gross: "₦30,000", net: "₦25,500",
      status: "Waiting on you", isRequest: true, deadline: "Sent 2 days ago, this is late",
      notes: "Bringing a 14 year old. Your age limit is 16.",
      contact: "You will see it 24 hours before the walk.",
      facts: [
        { label: "Guests", value: "3" },
        { label: "They pay", value: "₦30,000" },
        { label: "Your commission", value: "₦4,500" },
        { label: "You receive", value: "₦25,500" },
      ],
    },
    {
      ...base,
      id: "b3", ref: "MJ-4471", tab: "Upcoming", when: whenFor(1), listing: PHOTOWALK, date: day(1), name: "Ifeoma Adeyemi",
      rowNote: "Walking stick, asked about stairs", line: `Photowalk · ${day(1)}, 16:00`, money: "4 places · ₦40,000", guests: 4, gross: "₦40,000", net: "₦34,000",
      status: "Confirmed",
      notes: "One of them uses a walking stick, asked about the stairs.",
      contact: "+234 803 555 0142 · unlocked, the walk is tomorrow",
      facts: [
        { label: "Guests", value: "4" },
        { label: "They paid", value: "₦40,000" },
        { label: "Your commission", value: "₦6,000" },
        { label: "You receive", value: "₦34,000" },
      ],
    },
    {
      ...base,
      id: "b6", ref: "MJ-4488", tab: "Upcoming", when: whenFor(9), listing: PORTRAITS, date: day(9), name: "Yemi Balogun",
      rowNote: "", line: `Portraits · ${day(9)}, 09:00`, money: "2 places · ₦18,000", guests: 2, gross: "₦18,000", net: "₦15,300",
      status: "Confirmed", notes: "None.", contact: "You will see it 24 hours before the session.",
      facts: [
        { label: "Guests", value: "2" },
        { label: "They paid", value: "₦18,000" },
        { label: "Your commission", value: "₦2,700" },
        { label: "You receive", value: "₦15,300" },
      ],
    },
    {
      ...base,
      id: "b4", ref: "MJ-4455", tab: "Completed", when: "past", listing: PHOTOWALK, date: day(-6), name: "Segun Olaniyi",
      rowNote: "", line: `Photowalk · ${day(-6)}`, money: "2 places · ₦20,000", guests: 2, gross: "₦20,000", net: "₦17,000",
      status: "Paid out", notes: "None.", contact: "+234 806 555 0117",
      facts: [
        { label: "Guests", value: "2" },
        { label: "They paid", value: "₦20,000" },
        { label: "Your commission", value: "₦3,000" },
        { label: "You received", value: "₦17,000" },
      ],
    },
    {
      ...base,
      id: "b5", ref: "MJ-4440", tab: "Cancelled", when: "past", listing: PHOTOWALK, date: day(-13), name: "Bisi Lawal",
      rowNote: "Cancelled 2 days before", line: `Photowalk · ${day(-13)}`, money: "1 place · ₦10,000", guests: 1, gross: "₦10,000", net: "₦0",
      status: "Cancelled by guest", notes: "None.", contact: "Closed.",
      facts: facts(1, 10000, 0, true, true).map((f, i) => (i === 3 ? { ...f, value: formatNaira(0) } : f)),
      timeline: [
        { title: `Booked on ${day(-20)}`, body: "One place, ₦10,000 paid up front. Your Saturday showed 7 of 8 filled." },
        { title: `Cancelled by Bisi on ${day(-15)}`, body: "Two days before, which is outside your 48 hour window, so a full refund was automatic. You did not have to decide anything." },
        { title: `₦10,000 refunded on ${day(-15)}`, body: "Back on her card in three working days. We took no commission, so this booking is worth ₦0 to you." },
        { title: "The place went back on sale", body: "Your Saturday went back to 6 of 8 and stayed open. Nobody took it before the walk." },
      ],
      cancelNote:
        "This one does not count against you. A guest cancelling more than 48 hours ahead never touches your rating or where you show up in search. If you start seeing several cancellations on the same listing, it usually means the meeting point or the start time is not clear enough.",
    },
  ];
}
