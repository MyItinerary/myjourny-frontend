import { describe, expect, it } from "vitest";

import { SAMPLE_RECEIPT } from "./receipt.test-fixtures";

describe("receipt.test-fixtures", () => {
  it("provides valid SAMPLE_RECEIPT for testing", () => {
    expect(SAMPLE_RECEIPT.orderNumber).toBe("MJ-EV-48213");
    expect(SAMPLE_RECEIPT.billedTo).toBe("Ireti George");
  });
});
