import { describe, expect, it } from "vitest";

import type { EarningsBooking } from "./earnings.types";
import { formatAmount, payoutStatusLabel, sessionDate, statementCsv } from "./earnings";

const booking: EarningsBooking = {
  booking_id: "a474ab19-9ae3-4f3d-b229-fc6434382fa0",
  experience_title: "Lagos food walk",
  session_at: "2026-11-29T15:00:00",
  currency: "NGN",
  earned: "30000.00",
  pending: "0.00",
  paid_out: "30000.00",
  payout_status: "paid",
};

describe("formatAmount", () => {
  it("formats decimal strings without float rounding", () => {
    expect(formatAmount("48000.00", "NGN")).toBe("₦48,000");
    expect(formatAmount("12345678901234567890.50", "USD")).toBe("$12,345,678,901,234,567,890.50");
    expect(formatAmount("120.5", "EUR")).toBe("€120.50");
  });

  it("keeps an unknown currency readable", () => {
    expect(formatAmount("12.00", "XYZ")).toBe("XYZ12");
  });
});

describe("sessionDate", () => {
  it("treats timestamps without an offset as UTC", () => {
    expect(sessionDate("2026-11-29T15:00:00")).toBe("29 Nov 2026");
    expect(sessionDate("2026-11-29T15:00:00Z")).toBe("29 Nov 2026");
  });

  it("handles missing and invalid session times", () => {
    expect(sessionDate(null)).toBe("Not scheduled");
    expect(sessionDate("not-a-date")).toBe("Not scheduled");
  });
});

describe("statementCsv", () => {
  it("exports the ledger values, one row per booking", () => {
    expect(statementCsv([booking]).split("\n")).toEqual([
      "Booking ID,Experience,Session date,Currency,Earned,Pending,Paid out,Payout status",
      "a474ab19-9ae3-4f3d-b229-fc6434382fa0,Lagos food walk,2026-11-29T15:00:00,NGN,30000.00,0.00,30000.00,paid",
    ]);
  });

  it("quotes CSV cells that contain commas or quotes", () => {
    expect(statementCsv([{ ...booking, experience_title: 'Food walk, "old town"' }]).split("\n")[1])
      .toContain('"Food walk, ""old town"""');
  });

  it("exports a header for an empty statement", () => {
    expect(statementCsv([])).toBe("Booking ID,Experience,Session date,Currency,Earned,Pending,Paid out,Payout status");
  });
});

it("labels payout states", () => {
  expect(payoutStatusLabel("partial")).toBe("Partial");
});
