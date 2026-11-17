import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONTACT_MAILTO,
  FOOTER_LEGAL_LINKS,
  FOOTER_LINK_COLUMNS,
  FOOTER_SOCIAL_LINKS,
  SAFETY_MAILTO,
} from "./footer-content";

describe("footer content", () => {
  it("lists the two link columns in order without the Myjourny column", () => {
    expect(FOOTER_LINK_COLUMNS.map((c) => c.heading)).toEqual(["Support", "Hosting and Curating"]);
    expect(FOOTER_LINK_COLUMNS.every((c) => c.links.length > 0)).toBe(true);
  });

  it("excludes removed footer items, including anything about events while they're on hold", () => {
    const labels = FOOTER_LINK_COLUMNS.flatMap((c) => c.links.map((l) => l.label));
    for (const removed of [
      "Payment protection",
      "Help Center",
      "Host an event",
      "How hosting pays",
      "Hosting responsibly",
      "Why book with us",
      "Experiences",
    ]) {
      expect(labels).not.toContain(removed);
    }
    expect(labels.some((l) => /events?\b/i.test(l))).toBe(false);
  });

  it("routes Support and Hosting and Curating links accurately", () => {
    const support = FOOTER_LINK_COLUMNS.find((c) => c.heading === "Support");
    const hosting = FOOTER_LINK_COLUMNS.find((c) => c.heading === "Hosting and Curating");

    expect(CONTACT_MAILTO).toBe("mailto:hello@myjourny.io");
    expect(SAFETY_MAILTO).toBe(CONTACT_MAILTO);
    expect(support?.links).toEqual([
      { label: "Safety Guide", href: "/legal/safety" },
      { label: "Report a safety concern", href: CONTACT_MAILTO },
      { label: "Cancellation and Refund Policy", href: "/legal/cancellations" },
      { label: "Terms of use", href: "/legal/terms" },
      { label: "Cookie policy", href: "/legal/cookies" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Community guidelines and review policy", href: "/legal/community-guidelines" },
      { label: "Blog", href: "#" },
      { label: "Contact us", href: CONTACT_MAILTO },
    ]);
    expect(hosting?.links).toEqual([
      { label: "Become a host", href: "/become-a-guide" },
      { label: "Host Terms", href: "/legal/hosts" },
    ]);
  });

  it("keeps only Cookie preferences in the bottom row, so no policy is listed twice", () => {
    expect(FOOTER_LEGAL_LINKS).toEqual([{ label: "Cookie preferences", href: "/legal/cookies" }]);

    const columnLabels = FOOTER_LINK_COLUMNS.flatMap((c) => c.links.map((l) => l.label));
    expect(FOOTER_LEGAL_LINKS.some((l) => columnLabels.includes(l.label))).toBe(false);
  });

  it("has the socials", () => {
    expect(FOOTER_SOCIAL_LINKS.map((s) => s.label)).toEqual(["LinkedIn", "X", "Instagram"]);
  });

  it("only links to pages that exist", () => {
    const internal = [...FOOTER_LINK_COLUMNS.flatMap((c) => c.links), ...FOOTER_LEGAL_LINKS]
      .map((l) => l.href)
      .filter((href) => href.startsWith("/"));

    for (const href of internal) {
      expect(existsSync(join(process.cwd(), "app", href, "page.tsx")), href).toBe(true);
    }
  });
});
