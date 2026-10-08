import { describe, expect, it } from "vitest";

import { describeRule, formatPrice, UNIT_SUFFIX } from "./format";

describe("formatPrice", () => {
  it("formats money in the given currency", () => {
    expect(formatPrice(5000, "NGN")).toBe("₦5,000.00");
    expect(formatPrice(12.5, "USD")).toContain("12.50");
  });
});

describe("UNIT_SUFFIX", () => {
  it("labels every pricing unit", () => {
    expect(UNIT_SUFFIX).toEqual({
      per_person: "/ person",
      per_booking: "/ group",
      per_day: "/ person / day",
    });
  });
});

describe("describeRule", () => {
  it("describes a group discount", () => {
    expect(describeRule({ id: "r", kind: "group", min_guests: 4, percent_off: "10.00" }, "NGN")).toBe(
      "10% off for 4+ guests",
    );
  });

  it("describes an early-bird price or percentage", () => {
    const price = describeRule(
      { id: "r", kind: "early_bird", book_before: "2030-06-01T00:00:00", unit_amount: "4000" },
      "NGN",
    );
    const percent = describeRule(
      { id: "r", kind: "early_bird", book_before: "2030-06-01T00:00:00", percent_off: 15 },
      "NGN",
    );
    expect(price).toMatch(/^Early-bird price ₦4,000.00 when booked before June 1$/);
    expect(percent).toBe("15% early-bird discount when booked before June 1");
  });

  it("describes a day-of-week rate", () => {
    expect(
      describeRule({ id: "r", kind: "day_of_week", days_of_week: [5, 6], unit_amount: 6000 }, "NGN"),
    ).toBe("Special rate: ₦6,000.00 on Sat, Sun");
    expect(
      describeRule({ id: "r", kind: "day_of_week", label: "Weekend", days_of_week: [5], unit_amount: 6000 }, "NGN"),
    ).toBe("Weekend: ₦6,000.00 on Sat");
  });

  it("returns null for an incomplete rule", () => {
    expect(describeRule({ id: "r", kind: "group" }, "NGN")).toBeNull();
    expect(describeRule({ id: "r", kind: "day_of_week", days_of_week: [] }, "NGN")).toBeNull();
  });
});
