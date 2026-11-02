import { describe, expect, it } from "vitest";

import { initials, TONE_CLASSES } from "./event-tones";

describe("event tones", () => {
  it("has a class for each of the five tones", () => {
    expect(Object.keys(TONE_CLASSES)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("takes initials from the name, skipping a title", () => {
    expect(initials("Amara Okoye")).toBe("AO");
    expect(initials("Dr. Femi Adeyemi")).toBe("FA");
    expect(initials("Tobi")).toBe("T");
  });
});
