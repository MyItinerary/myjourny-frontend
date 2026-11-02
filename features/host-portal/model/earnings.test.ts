import { describe, expect, it } from "vitest";

import { COMMISSION_RATE, earningsRow, earningsSummary, rangeFor, RANGE_OPTIONS, statementCsv, transactionsIn } from "./earnings";
import { sampleEarnings } from "./sample-earnings";

const today = "2026-09-19";
const txns = sampleEarnings(today).transactions;
const refs = (list: { ref: string }[]) => list.map((t) => t.ref);

describe("rangeFor", () => {
  it("words and bounds each range as of today", () => {
    expect(rangeFor("This month", today, "March 2026")).toEqual({ start: "2026-09-01", end: "2026-09-30", label: "1 to 30 September 2026" });
    expect(rangeFor("Last month", today, "March 2026")).toEqual({ start: "2026-08-01", end: "2026-08-31", label: "1 to 31 August 2026" });
    expect(rangeFor("Last 3 months", today, "March 2026")).toEqual({ start: "2026-07-01", end: "2026-09-30", label: "1 July to 30 September 2026" });
    expect(rangeFor("This year", today, "March 2026")).toEqual({ start: "2026-01-01", end: "2026-09-30", label: "1 January to 30 September 2026" });
    expect(rangeFor("Everything", today, "March 2026")).toEqual({ start: null, end: null, label: "March 2026 to today" });
  });

  it("offers the five ranges", () => {
    expect(RANGE_OPTIONS).toEqual(["This month", "Last month", "Last 3 months", "This year", "Everything"]);
  });
});

describe("transactionsIn", () => {
  it("keeps what falls in the range", () => {
    const month = rangeFor("This month", today, "x");
    expect(refs(transactionsIn(txns, month.start, month.end))).toEqual(["MJ-4471", "MJ-4468", "MJ-4455", "MJ-4502", "MJ-4503"]);
    const last = rangeFor("Last month", today, "x");
    expect(refs(transactionsIn(txns, last.start, last.end))).toEqual(["MJ-4431"]);
    expect(transactionsIn(txns, null, null)).toHaveLength(6);
  });
});

describe("earningsRow", () => {
  it("works out the commission and what the host receives, and says it plainly", () => {
    expect(COMMISSION_RATE).toBe(0.15);
    expect(earningsRow(txns[0])).toEqual({
      ref: "MJ-4471",
      what: "Photowalk · Ifeoma Adeyemi, 4 places",
      date: "13 Sept",
      gross: "₦40,000",
      commission: "- ₦6,000",
      net: "₦34,000",
      status: "Cleared",
      plain: "₦40,000 booking, 15 percent commission ₦6,000, you receive ₦34,000.",
    });
  });

  it("rounds the commission to the naira", () => {
    expect(earningsRow({ ...txns[0], gross: 7550 }).commission).toBe("- ₦1,133");
  });
});

describe("statementCsv", () => {
  it("has a header and a line per booking", () => {
    const lines = statementCsv(txns.slice(0, 2)).split("\n");
    expect(lines).toEqual([
      "Reference,Booking,Date,Guests paid,Commission,You receive,Status",
      'MJ-4471,"Photowalk · Ifeoma Adeyemi, 4 places",2026-09-13,40000,6000,34000,Cleared',
      'MJ-4468,"Photowalk · Segun Olaniyi, 2 places",2026-09-13,20000,3000,17000,Cleared',
    ]);
  });

  it("quotes cells with quotes in them", () => {
    const csv = statementCsv([{ ...txns[0], what: 'He said "hi"' }]);
    expect(csv.split("\n")[1]).toContain('"He said ""hi"""');
  });

  it("is just the header with nothing to list", () => {
    expect(statementCsv([])).toBe("Reference,Booking,Date,Guests paid,Commission,You receive,Status");
  });
});

describe("earningsSummary", () => {
  it("sums up the month and what's clearing", () => {
    expect(earningsSummary(248000, 68000, true)).toBe("₦248,000 this month · ₦68,000 clearing");
    expect(earningsSummary(0, 0, false)).toBe("Nothing earned yet");
  });
});
