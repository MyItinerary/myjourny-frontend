import { describe, expect, it } from "vitest";

import { GUIDES, HELP_CARDS, SUPPORT_COPY, SUPPORT_EMAIL } from "./help-content";

describe("help content", () => {
  it("has the four guides, numbered in order, each with a body", () => {
    expect(GUIDES.map((g) => g.n)).toEqual(["1", "2", "3", "4"]);
    expect(GUIDES.every((g) => g.title && g.meta && g.body.length > 100)).toBe(true);
    expect(GUIDES[0].title).toBe("How to price an experience without guessing");
  });

  it("offers WhatsApp and email support", () => {
    expect(SUPPORT_COPY.whatsapp).toBe("Message us on WhatsApp");
    expect(SUPPORT_EMAIL).toBe("support@myjourny.app");
  });

  it("has a safety card and a community card", () => {
    expect(HELP_CARDS.safety.action).toBe("Read the safety rules");
    expect(HELP_CARDS.community.action).toBe("Ask to join");
  });
});
