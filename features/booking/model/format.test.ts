import { describe, expect, it } from "vitest";

import { describeRule, describeRules, formatMoneyCompact, formatPrice, formatPriceOrFree, formatSessionDay, formatSessionWhen, groupSizeLabel, guestLoginHref, safeExternalUrl, scheduleLabel, trimWholeAmount, UNIT_SUFFIX } from "./format";

describe("formatPrice", () => {
  it("formats money in the given currency", () => {
    expect(formatPrice(5000, "NGN")).toBe("₦5,000.00");
    expect(formatPrice(12.5, "USD")).toContain("12.50");
  });

  it("keeps ₦0.00 for amounts that aren't a price to pay", () => {
    expect(formatPrice(0, "NGN")).toBe("₦0.00");
  });
});

describe("formatPriceOrFree", () => {
  it("says Free for a price of nothing, and the amount otherwise", () => {
    expect(formatPriceOrFree(0, "NGN")).toBe("Free");
    expect(formatPriceOrFree(5000, "NGN")).toBe("₦5,000.00");
  });
});

describe("groupSizeLabel", () => {
  it("words the guest limits, treating a minimum of 1 as none", () => {
    expect(groupSizeLabel(3, 8)).toBe("3–8 guests per booking");
    expect(groupSizeLabel(4, 4)).toBe("Exactly 4 guests per booking");
    expect(groupSizeLabel(3, null)).toBe("At least 3 guests per booking");
    expect(groupSizeLabel(1, 1)).toBe("Up to 1 guest per booking");
    expect(groupSizeLabel(1, 6)).toBe("Up to 6 guests per booking");
    expect(groupSizeLabel(1, undefined)).toBeNull();
    expect(groupSizeLabel(null, null)).toBeNull();
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
      "10% off for 4+ guests, any mix of tickets",
    );
  });

  it("says how many more guests get the group discount, and when it applies", () => {
    const group = { id: "r", kind: "group", min_guests: 3, percent_off: "10.00" } as const;
    expect(describeRule(group, "NGN", { guests: 1 })).toBe(
      "10% off for 3+ guests, any mix of tickets. Add 2 more to qualify.",
    );
    expect(describeRule(group, "NGN", { guests: 3 })).toBe("Your booking qualifies for 10% off (3+ guests)");
  });

  it("hides an early-bird offer that has ended", () => {
    const rule = { id: "r", kind: "early_bird", book_before: "2030-06-01T00:00:00", percent_off: 1 } as const;
    expect(describeRule(rule, "NGN", { now: new Date("2030-05-31T23:00:00Z") })).toBe(
      "1% early-bird discount when booked before June 1",
    );
    expect(describeRule(rule, "NGN", { now: new Date("2030-06-01T00:00:00Z") })).toBeNull();
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

describe("safeExternalUrl", () => {
  it("keeps http(s) links and drops anything that could run script", () => {
    expect(safeExternalUrl("https://tickets.example.com/kayak")).toBe("https://tickets.example.com/kayak");
    expect(safeExternalUrl("http://example.com")).toBe("http://example.com/");
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeExternalUrl("not a url")).toBeNull();
    expect(safeExternalUrl(null)).toBeNull();
  });
});

describe("guestLoginHref", () => {
  it("returns to the experience after logging in", () => {
    expect(guestLoginHref("exp-1")).toBe("/login?next=%2Fexperiences%2Fexp-1");
  });
});

describe("formatSessionWhen", () => {
  it("shows a one-day session in its own zone", () => {
    // 08:00 UTC is 9:00 in Lagos, whatever the test machine's zone.
    expect(formatSessionWhen("2030-06-01T08:00:00", "2030-06-01T11:00:00", "Africa/Lagos")).toBe(
      "Saturday, June 1 at 9:00 AM",
    );
  });

  it("shows a session over several days as a range", () => {
    expect(formatSessionWhen("2030-06-01T08:00:00Z", "2030-06-03T10:00:00Z", "Africa/Lagos")).toBe(
      "Sat, June 1 at 9:00 AM – Mon, June 3",
    );
  });

  it("defaults to Lagos and works without an end", () => {
    expect(formatSessionWhen("2030-06-01T23:30:00")).toBe("Sunday, June 2 at 12:30 AM");
  });
});

describe("scheduleLabel", () => {
  it("describes weekly schedules", () => {
    expect(scheduleLabel({ schedule_type: "recurring", recurrence_type: "weekly", recurrence_days: ["sat"], length_days: 3 })).toBe(
      "Every Saturday · 3 days",
    );
    expect(
      scheduleLabel({ schedule_type: "recurring", recurrence_type: "weekly", recurrence_interval: 2, recurrence_days: ["fri", "sat"] }),
    ).toBe("Every 2 weeks on Fri, Sat");
  });

  it("describes other recurrences and one-offs", () => {
    expect(scheduleLabel({ schedule_type: "recurring", recurrence_type: "monthly" })).toBe("Every month");
    expect(scheduleLabel({ schedule_type: "recurring", recurrence_type: "daily", recurrence_interval: 3 })).toBe("Every 3 days");
    expect(scheduleLabel({ schedule_type: "one_off", event_start_date: "2030-06-01", event_end_date: "2030-06-03" })).toBe(
      "One-off · 3 days",
    );
    expect(scheduleLabel({ schedule_type: "one_off", event_start_date: "2030-06-01" })).toBe("One-off");
  });

  it("is null without a schedule", () => {
    expect(scheduleLabel({ schedule_type: null })).toBeNull();
    expect(scheduleLabel({ schedule_type: "recurring" })).toBeNull();
  });
});

describe("describeRules", () => {
  const group = { id: "g", kind: "group", min_guests: 3, percent_off: "10.00" } as const;
  const early = { id: "e", kind: "early_bird", book_before: "2030-06-01T00:00:00", percent_off: 1 } as const;

  it("says only the biggest discount is used when several are on offer", () => {
    expect(describeRules([group, early], "NGN", { now: new Date("2030-05-01T00:00:00Z") })).toEqual([
      "10% off for 3+ guests, any mix of tickets",
      "1% early-bird discount when booked before June 1",
      "Discounts don't combine: you get the biggest one you qualify for.",
    ]);
  });

  it("drops that note once early-bird has ended", () => {
    expect(describeRules([group, early], "NGN", { now: new Date("2030-07-01T00:00:00Z") })).toEqual([
      "10% off for 3+ guests, any mix of tickets",
    ]);
  });
});

describe("formatMoneyCompact", () => {
  it("drops kobo from whole amounts and keeps real ones", () => {
    expect(formatMoneyCompact(16000, "NGN")).toBe("₦16,000");
    expect(formatMoneyCompact(16000.5, "NGN")).toBe("₦16,000.50");
  });
});

describe("trimWholeAmount", () => {
  it("drops empty kobo only", () => {
    expect(trimWholeAmount("₦16,000.00")).toBe("₦16,000");
    expect(trimWholeAmount("₦16,000.50")).toBe("₦16,000.50");
    expect(trimWholeAmount("₦5,000.00 / person")).toBe("₦5,000 / person");
  });
});

describe("formatSessionDay", () => {
  it("gives the day only, in the session's zone", () => {
    expect(formatSessionDay("2030-10-19T11:00:00Z", "Africa/Lagos")).toBe("Saturday, October 19");
    // 23:30 UTC is already the next day in Lagos.
    expect(formatSessionDay("2030-10-19T23:30:00Z", "Africa/Lagos")).toBe("Sunday, October 20");
  });
});
