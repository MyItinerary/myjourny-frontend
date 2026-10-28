import { describe, expect, it } from "vitest";

import { experienceHref } from "./experience-href";

describe("experienceHref", () => {
  it("sends events to their own page and everything else to the experience page", () => {
    expect(experienceHref("e-1", "event")).toBe("/events/e-1");
    expect(experienceHref("x-1", "experience")).toBe("/experiences/x-1");
    expect(experienceHref("x-1")).toBe("/experiences/x-1");
  });
});

describe("card mappers", () => {
  it("send an event card to its page, with its date and area", async () => {
    const { experienceListItemToCardProps, experienceMatchToCardProps } = await import("@/lib/queries/experiences");
    const event = experienceListItemToCardProps({
      id: "evt-1",
      title: "Lagos Design Night",
      kind: "event",
      city: "Lagos",
      area: "Lagos Island",
      event_start_date: "2030-11-16",
      duration_minutes: 240,
    });
    expect(event).toMatchObject({ href: "/events/evt-1", category: "Lagos Island", duration: "Sat 16 Nov" });

    const experience = experienceListItemToCardProps({ id: "exp-1", title: "Lagoon kayak", city: "Lagos", duration_minutes: 90 });
    expect(experience).toMatchObject({ href: "/experiences/exp-1", category: "Lagos" });

    const match = experienceMatchToCardProps({
      experience_id: "evt-2",
      match_score: 1,
      reasons: [],
      explanation: "",
      title: "Abuja Design Week",
      currency: "NGN",
      safetyBadgeCount: 0,
      kind: "event",
    });
    expect(match.href).toBe("/events/evt-2");
  });
});
