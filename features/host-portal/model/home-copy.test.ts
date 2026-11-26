import { describe, expect, it } from "vitest";

import { EMPTY_PITCH, EMPTY_SUBTITLE, fullSubtitle, greetingFor, longDay, SELL_POINTS, TEMPLATES_COPY } from "./home-copy";

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
  it("has three selling points", () => {
    expect(SELL_POINTS.map((p) => p.n)).toEqual(["1", "2", "3"]);
  });

  it("pitches a new host their first experience, without saying they are approved", () => {
    expect(EMPTY_PITCH.eyebrow).toBe("Create your first experience");
    expect(EMPTY_PITCH.heading).toBe("You probably do this often, now you can make some money out of it.");
    expect(EMPTY_PITCH.body).toBe("When you list an experience, you get to keep 85% of the payout and get paid the same day.");
    expect(`${EMPTY_SUBTITLE} ${EMPTY_PITCH.eyebrow}`).not.toMatch(/approved/i);
    expect(TEMPLATES_COPY.heading).toBe("Templates you can start from");
  });
});
