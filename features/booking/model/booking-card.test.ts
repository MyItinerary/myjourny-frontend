import { describe, expect, it } from "vitest";

import { dateFieldLabel, shortDay, shortPrice, shortPriceOrFree, urgencyFor, weekdayDay } from "./booking-card";

describe("shortPrice", () => {
  it("drops the decimals from whole naira and keeps kobo", () => {
    expect(shortPrice(16000, "NGN")).toBe("₦16,000");
    expect(shortPrice(16000.5, "NGN")).toBe("₦16,000.50");
  });
});

describe("shortPriceOrFree", () => {
  it("says Free for nothing and a price otherwise", () => {
    expect(shortPriceOrFree(0, "NGN")).toBe("Free");
    expect(shortPriceOrFree(5000, "NGN")).toBe("₦5,000");
  });
});

describe("dateFieldLabel", () => {
  it("names one day", () => {
    expect(dateFieldLabel("2026-09-12")).toBe("Sat 12 September");
  });

  it("names a range in one month", () => {
    expect(dateFieldLabel("2026-09-11", "2026-09-13")).toBe("Fri 11 to Sun 13 September");
  });

  it("names the month on both ends across months", () => {
    expect(dateFieldLabel("2026-09-30", "2026-10-02")).toBe("Wed 30 September to Fri 2 October");
  });

  it("treats the same start and end as one day", () => {
    expect(dateFieldLabel("2026-09-12", "2026-09-12")).toBe("Sat 12 September");
  });
});

describe("shortDay", () => {
  it("says day and short month", () => {
    expect(shortDay("2026-09-12")).toBe("12 Sept");
    expect(weekdayDay("2026-09-12")).toBe("Sat 12 Sept");
  });
});

describe("urgencyFor", () => {
  it("says nothing with plenty of room, or an unlimited experience", () => {
    expect(urgencyFor(6, "7:00am", "Sat 12 Sept")).toBeNull();
    expect(urgencyFor(null, "7:00am", "Sat 12 Sept")).toBeNull();
    expect(urgencyFor(0, "7:00am", "Sat 12 Sept")).toBeNull();
  });

  it("names the slot at five or fewer, and the last spot heavier", () => {
    expect(urgencyFor(3, "7:00am", "Sat 12 Sept")).toEqual({ level: "few", text: "3 spots left at 7:00am on Sat 12 Sept" });
    expect(urgencyFor(1, "7:00am", "Sat 12 Sept")).toEqual({ level: "one", text: "Last spot at 7:00am on Sat 12 Sept" });
  });
});
