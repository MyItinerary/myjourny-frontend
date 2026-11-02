import { describe, expect, it } from "vitest";

import { EXAMPLES, fullSubtitle, greetingFor, longDay, SELL_POINTS } from "./home-copy";

const at = (hour: number) => new Date(2026, 8, 19, hour, 30);

describe("greetingFor", () => {
  it("follows the hour", () => {
    expect(greetingFor(at(7))).toBe("Good morning");
    expect(greetingFor(at(12))).toBe("Good afternoon");
    expect(greetingFor(at(17))).toBe("Good afternoon");
    expect(greetingFor(at(18))).toBe("Good evening");
  });
});

describe("longDay", () => {
  it("spells out the day", () => {
    expect(longDay(at(9))).toBe("Saturday 19 September");
  });
});

describe("fullSubtitle", () => {
  it("counts what needs the host", () => {
    expect(fullSubtitle(at(9), 3)).toBe("Saturday 19 September · three things need you today");
    expect(fullSubtitle(at(9), 1)).toBe("Saturday 19 September · one thing needs you today");
    expect(fullSubtitle(at(9), 12)).toBe("Saturday 19 September · 12 things need you today");
  });

  it("is just the day when nothing does", () => {
    expect(fullSubtitle(at(9), 0)).toBe("Saturday 19 September");
  });
});

describe("static copy", () => {
  it("has three examples and three selling points", () => {
    expect(EXAMPLES).toHaveLength(3);
    expect(SELL_POINTS.map((p) => p.n)).toEqual(["1", "2", "3"]);
  });
});
