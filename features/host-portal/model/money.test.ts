import { describe, expect, it } from "vitest";

import { formatNaira } from "./money";

describe("formatNaira", () => {
  it("groups thousands and drops the kobo", () => {
    expect(formatNaira(1046000)).toBe("₦1,046,000");
    expect(formatNaira(7500.6)).toBe("₦7,501");
    expect(formatNaira(0)).toBe("₦0");
  });
});
