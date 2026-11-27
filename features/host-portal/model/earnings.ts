import type { EarningsBooking } from "./earnings.types";

/** The current host commission, also used in listing price previews. */
export const COMMISSION_RATE = 0.15;

/** Format decimal ledger amounts without converting them to binary floats. */
export function formatAmount(amount: string, currency: string): string {
  const parsed = /^(-?)(\d+)(?:\.(\d+))?$/.exec(amount.trim());
  if (!parsed) return `${currency} ${amount}`;

  const [, sign, whole, rawFraction = ""] = parsed;
  const fraction = /^0+$/.test(rawFraction) ? "" : rawFraction.length < 2 ? rawFraction.padEnd(2, "0") : rawFraction;
  const groupedWhole = new Intl.NumberFormat("en-US").format(BigInt(whole));
  let symbol = currency;
  try {
    symbol =
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 0,
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? currency;
  } catch {
    // Unknown currency codes remain readable as their code.
  }
  return `${sign}${symbol}${groupedWhole}${fraction ? `.${fraction}` : ""}`;
}

/** The backend sends UTC timestamps, sometimes without a trailing Z. */
export function sessionDate(sessionAt: string | null): string {
  if (!sessionAt) return "Not scheduled";
  const utc = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(sessionAt) ? sessionAt : `${sessionAt}Z`;
  const date = new Date(utc);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

const csvCell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** Downloadable ledger statement: one line per booking with the backend amounts. */
export function statementCsv(bookings: EarningsBooking[]): string {
  const header = ["Booking ID", "Experience", "Session date", "Currency", "Earned", "Pending", "Paid out", "Payout status"];
  const lines = bookings.map((booking) => [
    booking.booking_id,
    booking.experience_title,
    booking.session_at ?? "",
    booking.currency,
    booking.earned,
    booking.pending,
    booking.paid_out,
    booking.payout_status,
  ]);
  return [header, ...lines].map((line) => line.map(csvCell).join(",")).join("\n");
}

export function payoutStatusLabel(status: EarningsBooking["payout_status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
