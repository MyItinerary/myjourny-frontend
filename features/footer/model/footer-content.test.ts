import { describe, expect, it } from "vitest";

import { FOOTER_LEGAL_LINKS, FOOTER_LINK_COLUMNS, FOOTER_SOCIAL_LINKS, SAFETY_MAILTO } from "./footer-content";

describe("footer content", () => {
  it("lists the two link columns in order without the Myjourny column", () => {
    expect(FOOTER_LINK_COLUMNS.map((c) => c.heading)).toEqual(["Support", "Hosting and Curating"]);
    expect(FOOTER_LINK_COLUMNS.every((c) => c.links.length > 0)).toBe(true);
  });

  it("excludes removed footer items", () => {
    const labels = FOOTER_LINK_COLUMNS.flatMap((c) => c.links.map((l) => l.label));
    for (const removed of [
      "Help Center",
      "Payment protection",
      "Host an event",
      "How hosting pays",
      "Hosting responsibly",
    ]) {
      expect(labels).not.toContain(removed);
    }
  });

  it("routes Support and Hosting and Curating links accurately", () => {
    const support = FOOTER_LINK_COLUMNS.find((c) => c.heading === "Support");
    const hosting = FOOTER_LINK_COLUMNS.find((c) => c.heading === "Hosting and Curating");

    expect(SAFETY_MAILTO).toBe("mailto:hello@myjourny.io");
    expect(support?.links).toEqual([
      { label: "Safety Guide", href: "/legal/safety" },
      { label: "Report a safety concern", href: SAFETY_MAILTO },
      { label: "Cancellation and Refund Policy", href: "/legal/cancellations" },
      { label: "Terms of use", href: "/legal/terms" },
      { label: "Cookie policy", href: "/legal/cookies" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Community guidelines and review policy", href: "/legal/community-guidelines" },
      { label: "Blog", href: "#" },
      { label: "Contact us", href: SAFETY_MAILTO },
    ]);
    expect(hosting?.links).toEqual([
      { label: "Become a host", href: "#" },
      { label: "Host Terms", href: "/legal/hosts" },
    ]);
  });

  it("has the legal links and socials", () => {
    expect(FOOTER_LEGAL_LINKS.map((l) => l.label)).toEqual(["Privacy policy", "Terms of use", "Cookie policy", "Cookie preferences"]);
    expect(FOOTER_LEGAL_LINKS.every((l) => l.href.startsWith("/legal/"))).toBe(true);
    expect(FOOTER_SOCIAL_LINKS.map((s) => s.label)).toEqual(["LinkedIn", "X", "Instagram"]);
  });
});
