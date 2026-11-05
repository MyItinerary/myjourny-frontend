import { describe, expect, it } from "vitest";

import { formatMoney } from "./receipt.types";
import { SAMPLE_RECEIPT } from "./receipt.test-fixtures";

describe("receipt.types", () => {
  it("provides valid SAMPLE_RECEIPT data for tests", () => {
    expect(SAMPLE_RECEIPT.orderNumber).toBe("MJ-EV-48213");
    expect(SAMPLE_RECEIPT.paymentReference).toBe("MJPAY-7F3A91C2");
    expect(SAMPLE_RECEIPT.billedTo).toBe("Ireti George");
    expect(SAMPLE_RECEIPT.paidAmount).toBe(24000);
    expect(SAMPLE_RECEIPT.totalPriceFormatted).toBe("₦24,000");
  });

  it("formats currency accurately using given currency code", () => {
    expect(formatMoney(24000, "NGN")).toMatch(/24,000/);
    expect(formatMoney(19.99, "USD")).toBe("$19.99");
    expect(formatMoney(100, "USD")).toBe("$100");
    expect(formatMoney("invalid", "NGN")).toMatch(/₦0/);
    expect(formatMoney("invalid", "USD")).toBe("$0");
    expect(formatMoney("invalid", null)).toBe("0");
  });
});
