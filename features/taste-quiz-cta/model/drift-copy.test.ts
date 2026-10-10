import { describe, expect, it } from "vitest";

import { driftCopy } from "./drift-copy";

describe("driftCopy", () => {
  it("names the count, the new category and the saved interests", () => {
    const copy = driftCopy({ count: 3, category: "water activities", interests: ["art", "food"] });
    expect(copy.title).toBe("Your taste has drifted.");
    expect(copy.body).toBe(
      "You’ve booked three experiences in water activities since you told us you were into art and food. Want to update what we show you?",
    );
    expect(copy.ctaLabel).toBe("Update my taste");
  });

  it("lists three interests with commas and uses digits past ten", () => {
    const copy = driftCopy({ count: 12, category: "nightlife", interests: ["a", "b", "c"] });
    expect(copy.body).toContain("booked 12 experiences in nightlife");
    expect(copy.body).toContain("into a, b and c.");
  });
});
