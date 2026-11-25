import { describe, expect, it } from "vitest";

import { FAQ_ITEMS } from "./become-a-guide-faq";

describe("FAQ_ITEMS", () => {
  it("defines the 9 FAQ questions matching the Figma designs", () => {
    expect(FAQ_ITEMS).toHaveLength(9);
    expect(FAQ_ITEMS[0].question).toBe("What does it cost to list?");
    expect(FAQ_ITEMS[0].answer).toBe("Nothing, and it never will.");
    expect(FAQ_ITEMS[1].question).toBe("What commission do you take?");
    expect(FAQ_ITEMS[2].question).toBe("When do I get paid?");
    expect(FAQ_ITEMS[3].question).toBe("Do I need a registered business?");
    expect(FAQ_ITEMS[4].question).toBe("What if I have never run a group experience?");
    expect(FAQ_ITEMS[5].question).toBe("Can I set my own price and dates?");
    expect(FAQ_ITEMS[6].question).toBe("Who handles refunds and disputes?");
    expect(FAQ_ITEMS[7].question).toBe("Can I still post it to my own followers?");
    expect(FAQ_ITEMS[8].question).toBe("What's the difference between an experience and an event?");
  });
});
