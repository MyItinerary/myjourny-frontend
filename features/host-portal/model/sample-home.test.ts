import { describe, expect, it } from "vitest";

import { SAMPLE_HOME } from "./sample-home";

describe("SAMPLE_HOME", () => {
  it("fills every part of the populated Home", () => {
    expect(SAMPLE_HOME.stats).toHaveLength(4);
    expect(SAMPLE_HOME.attention).toHaveLength(3);
    expect(SAMPLE_HOME.listings).toHaveLength(3);
    expect(SAMPLE_HOME.earnings.months).toHaveLength(6);
    expect(SAMPLE_HOME.next).not.toBeNull();
    expect(SAMPLE_HOME.reviews).toHaveLength(2);
  });

  it("only links inside the host portal", () => {
    const links = [...SAMPLE_HOME.attention.map((a) => a.href), ...SAMPLE_HOME.listings.map((l) => l.href), SAMPLE_HOME.next!.href];
    expect(links.every((href) => href.startsWith("/host/dashboard"))).toBe(true);
  });

  it("has the most recent month as the tallest bar the design draws", () => {
    const amounts = SAMPLE_HOME.earnings.months.map((m) => m.amountK);
    expect(amounts[amounts.length - 1]).toBe(Math.max(...amounts));
  });
});
