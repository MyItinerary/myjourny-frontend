import { addDays } from "./calendar";
import type { HostEarnings } from "./earnings.types";

// The numbers and six bookings the design shows, with dates placed relative to
// today so every range has something in it.
// Used only for the `?preview=full` view while itin has no host API.
export function sampleEarnings(today: string): HostEarnings {
  const on = (days: number) => addDays(today, days);
  return {
    since: "March 2026",
    monthEarned: 248000,
    clearing: 68000,
    stats: [
      { label: "Earned all time", value: "₦1,046,000", note: "since March 2026" },
      { label: "Clearing now", value: "₦68,000", note: "in your bank Tue 22 Sept" },
      { label: "Already paid out", value: "₦978,000", note: "across 14 payouts" },
      { label: "Next payout", value: "Tue 22 Sept", note: "batched weekly, every Tuesday" },
    ],
    transactions: [
      { ref: "MJ-4471", what: "Photowalk · Ifeoma Adeyemi, 4 places", date: on(-6), gross: 40000, status: "Cleared" },
      { ref: "MJ-4468", what: "Photowalk · Segun Olaniyi, 2 places", date: on(-6), gross: 20000, status: "Cleared" },
      { ref: "MJ-4455", what: "Photowalk · Blessing Uche, 3 places", date: on(-13), gross: 30000, status: "Cleared" },
      { ref: "MJ-4502", what: "Photowalk · Amaka Eze, 2 places", date: on(1), gross: 20000, status: "Clearing" },
      { ref: "MJ-4503", what: "Photowalk · Yemi Balogun, 2 places", date: on(1), gross: 20000, status: "Clearing" },
      { ref: "MJ-4431", what: "Portraits · Kemi Salami, 2 places", date: on(-20), gross: 28000, status: "Cleared" },
    ],
  };
}
