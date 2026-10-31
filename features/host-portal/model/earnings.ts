import { dateKey, MONTH_NAMES, parseKey, shortDate } from "./calendar";
import type { EarningsRange, EarningsTransaction } from "./earnings.types";
import { formatNaira } from "./money";

/** What MyJourny keeps from each booking. */
export const COMMISSION_RATE = 0.15;

export const RANGE_OPTIONS: EarningsRange[] = ["This month", "Last month", "Last 3 months", "This year", "Everything"];

const commissionOf = (gross: number) => Math.round(gross * COMMISSION_RATE);

/** The dates a range covers, as of `today` (inclusive), and how to word it. */
export function rangeFor(range: EarningsRange, today: string, since: string): { start: string | null; end: string | null; label: string } {
  const t = parseKey(today);
  const monthStart = (offset: number) => dateKey(new Date(t.getFullYear(), t.getMonth() + offset, 1));
  const monthEnd = (offset: number) => dateKey(new Date(t.getFullYear(), t.getMonth() + offset + 1, 0));
  const word = (key: string, withMonth: boolean) => {
    const d = parseKey(key);
    return withMonth ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}` : String(d.getDate());
  };
  const span = (start: string, end: string) => {
    const a = parseKey(start);
    const b = parseKey(end);
    const sameMonth = a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
    return `${word(start, !sameMonth)} to ${word(end, true)} ${b.getFullYear()}`;
  };

  switch (range) {
    case "This month":
      return { start: monthStart(0), end: monthEnd(0), label: span(monthStart(0), monthEnd(0)) };
    case "Last month":
      return { start: monthStart(-1), end: monthEnd(-1), label: span(monthStart(-1), monthEnd(-1)) };
    case "Last 3 months":
      return { start: monthStart(-2), end: monthEnd(0), label: span(monthStart(-2), monthEnd(0)) };
    case "This year":
      return { start: `${t.getFullYear()}-01-01`, end: monthEnd(0), label: span(`${t.getFullYear()}-01-01`, monthEnd(0)) };
    default:
      return { start: null, end: null, label: `${since} to today` };
  }
}

export function transactionsIn(transactions: EarningsTransaction[], start: string | null, end: string | null) {
  return transactions.filter((t) => (!start || t.date >= start) && (!end || t.date <= end));
}

export type EarningsRow = {
  ref: string;
  what: string;
  /** "13 Sept" */
  date: string;
  gross: string;
  /** "- ₦6,000" */
  commission: string;
  net: string;
  status: EarningsTransaction["status"];
  /** "₦40,000 booking, 15 percent commission ₦6,000, you receive ₦34,000." */
  plain: string;
};

export function earningsRow(t: EarningsTransaction): EarningsRow {
  const comm = commissionOf(t.gross);
  const net = t.gross - comm;
  const percent = Math.round(COMMISSION_RATE * 100);
  return {
    ref: t.ref,
    what: t.what,
    date: shortDate(t.date).split(" ").slice(1).join(" "),
    gross: formatNaira(t.gross),
    commission: `- ${formatNaira(comm)}`,
    net: formatNaira(net),
    status: t.status,
    plain: `${formatNaira(t.gross)} booking, ${percent} percent commission ${formatNaira(comm)}, you receive ${formatNaira(net)}.`,
  };
}

const csvCell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** A statement for the transactions shown, as CSV: one line per booking. */
export function statementCsv(transactions: EarningsTransaction[]): string {
  const header = ["Reference", "Booking", "Date", "Guests paid", "Commission", "You receive", "Status"];
  const lines = transactions.map((t) => {
    const comm = commissionOf(t.gross);
    return [t.ref, t.what, t.date, String(t.gross), String(comm), String(t.gross - comm), t.status];
  });
  return [header, ...lines].map((line) => line.map(csvCell).join(",")).join("\n");
}

/** "₦248,000 this month · ₦68,000 clearing", for the page header. */
export function earningsSummary(monthEarned: number, clearing: number, hasData: boolean): string {
  if (!hasData) return "Nothing earned yet";
  return `${formatNaira(monthEarned)} this month · ${formatNaira(clearing)} clearing`;
}

