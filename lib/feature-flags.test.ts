import { describe, expect, it } from "vitest";

import { eventsEnabled } from "./feature-flags";

describe("eventsEnabled", () => {
  it("is off unless the flag is exactly true", () => {
    expect(eventsEnabled({})).toBe(false);
    expect(eventsEnabled({ NEXT_PUBLIC_EVENTS_ENABLED: "false" })).toBe(false);
    expect(eventsEnabled({ NEXT_PUBLIC_EVENTS_ENABLED: "1" })).toBe(false);
    expect(eventsEnabled({ NEXT_PUBLIC_EVENTS_ENABLED: "true" })).toBe(true);
  });
});
