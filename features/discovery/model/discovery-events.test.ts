import { describe, expect, it } from "vitest";

import {
  EARLY_BIRD_EVENTS,
  NEXT_WEEK_EVENTS,
  PICKED_FOR_YOU_EVENTS,
  POPULAR_EVENTS_TODAY,
  THIS_WEEKEND_EVENTS,
} from "./discovery-events";

describe("placeholder events", () => {
  it("gives every rail five events with unique ids", () => {
    for (const rail of [POPULAR_EVENTS_TODAY, THIS_WEEKEND_EVENTS, EARLY_BIRD_EVENTS, PICKED_FOR_YOU_EVENTS, NEXT_WEEK_EVENTS]) {
      expect(rail).toHaveLength(5);
      expect(new Set(rail.map((e) => e.id)).size).toBe(5);
    }
  });
});
