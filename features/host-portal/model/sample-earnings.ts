import { addDays } from "./calendar";
import type { HostEarnings } from "./earnings.types";

// Earnings in the prototype preview, mapped to the backend ledger contract.
export function sampleEarnings(today: string): HostEarnings {
  const on = (days: number, time = "15:00:00") => `${addDays(today, days)}T${time}Z`;
  const booking = (
    booking_id: string,
    experience_title: string,
    days: number,
    earned: string,
    pending: string,
    paid_out: string,
    payout_status: "pending" | "partial" | "paid",
  ) => ({ booking_id, experience_title, session_at: on(days), currency: "NGN", earned, pending, paid_out, payout_status });

  return {
    totals: [{ currency: "NGN", earned: "1046000.00", pending: "68000.00", paid_out: "978000.00" }],
    bookings: [
      booking("MJ-4471", "Photowalk · Ifeoma Adeyemi, 4 places", -6, "34000.00", "0.00", "34000.00", "paid"),
      booking("MJ-4468", "Photowalk · Segun Olaniyi, 2 places", -6, "17000.00", "0.00", "17000.00", "paid"),
      booking("MJ-4455", "Photowalk · Blessing Uche, 3 places", -13, "25500.00", "0.00", "25500.00", "paid"),
      booking("MJ-4502", "Photowalk · Amaka Eze, 2 places", 1, "17000.00", "17000.00", "0.00", "pending"),
      booking("MJ-4503", "Photowalk · Yemi Balogun, 2 places", 1, "17000.00", "17000.00", "0.00", "pending"),
      booking("MJ-4431", "Portraits · Kemi Salami, 2 places", -20, "23800.00", "0.00", "23800.00", "paid"),
    ],
  };
}
