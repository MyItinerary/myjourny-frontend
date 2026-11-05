import { describe, expect, it } from "vitest";

import { formatNaira, SAMPLE_RECEIPT } from "./receipt.types";

describe("receipt.types", () => {
  it("provides valid SAMPLE_RECEIPT data matching Figma design", () => {
    expect(SAMPLE_RECEIPT.orderNumber).toBe("MJ-EV-48213");
    expect(SAMPLE_RECEIPT.paymentReference).toBe("MJPAY-7F3A91C2");
    expect(SAMPLE_RECEIPT.billedTo).toBe("Ireti George");
    expect(SAMPLE_RECEIPT.experienceTitle).toBe("Sunrise Kayaking at Tarkwa Bay");
    expect(SAMPLE_RECEIPT.partySizeLabel).toBe("1 Adult");
    expect(SAMPLE_RECEIPT.status).toBe("paid");
  });

  it("formats currency to Naira string", () => {
    expect(formatNaira(24000)).toMatch(/24,000/);
    expect(formatNaira("16000")).toMatch(/16,000/);
    expect(formatNaira("invalid")).toMatch(/0/);
  });
});
