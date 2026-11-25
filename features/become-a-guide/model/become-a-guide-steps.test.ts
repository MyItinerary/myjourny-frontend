import { describe, expect, it } from "vitest";

import { THREE_STEPS } from "./become-a-guide-steps";

describe("THREE_STEPS", () => {
  it("defines exactly three sequential onboarding steps", () => {
    expect(THREE_STEPS).toHaveLength(3);
    expect(THREE_STEPS[0].step).toBe("STEP 1");
    expect(THREE_STEPS[0].title).toBe("Create an account");
    expect(THREE_STEPS[0].isHighlighted).toBe(false);

    expect(THREE_STEPS[1].step).toBe("STEP 2 - THE PART MOST PEOPLE FEAR");
    expect(THREE_STEPS[1].title).toBe("We design it with you");
    expect(THREE_STEPS[1].isHighlighted).toBe(true);

    expect(THREE_STEPS[2].step).toBe("STEP 3");
    expect(THREE_STEPS[2].title).toBe("Go live and get paid");
    expect(THREE_STEPS[2].isHighlighted).toBe(false);
  });
});
