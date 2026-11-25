import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  FOOTER_LEGAL_LINKS,
  FOOTER_LINK_COLUMNS,
  FOOTER_SOCIAL_LINKS,
  CONTACT_MAILTO,
  visibleFooterColumns,
} from "./footer-content";

describe("footer content", () => {
  const visible = visibleFooterColumns(FOOTER_LINK_COLUMNS);
  const column = (heading: string) => visible.find((c) => c.heading === heading)?.links.map((l) => l.label);

  it("shows the Support, Guiding and Legal columns in order", () => {
    expect(visible.map((c) => c.heading)).toEqual(["Support", "Guiding and Curating", "Legal"]);
    expect(column("Support")).toEqual(["Safety Guide", "Report a safety concern", "Cancellation and Refund Policy", "Contact us", "Blog"]);
    expect(column("Guiding and Curating")).toEqual(["Become a guide", "Guide Terms"]);
  });

  const hiddenForLater = ["Payment protection", "Help Center", "Guide an event", "How guiding pays", "Guiding responsibly", "Why book with us", "Experiences", "Investors", "Gift cards"];

  it("hides the links QA asked to remove, including anything about events while they're on hold", () => {
    const labels = visible.flatMap((c) => c.links.map((l) => l.label));
    for (const hidden of hiddenForLater) {
      expect(labels).not.toContain(hidden);
    }
    expect(labels.some((l) => /events?\b/i.test(l))).toBe(false);
    expect(visible.map((c) => c.heading)).not.toContain("Myjourny");
  });

  it("keeps the hidden links and the Myjourny column in the data for later", () => {
    const labels = FOOTER_LINK_COLUMNS.flatMap((c) => c.links.map((l) => l.label));
    for (const hidden of hiddenForLater) {
      expect(labels).toContain(hidden);
    }
    expect(FOOTER_LINK_COLUMNS.find((c) => c.heading === "Myjourny")?.hidden).toBe(true);
  });

  it("drops hidden links and columns, and leaves the rest as they are", () => {
    expect(
      visibleFooterColumns([
        { heading: "A", links: [{ label: "Shown", href: "/a" }, { label: "Gone", href: "/b", hidden: true }] },
        { heading: "B", hidden: true, links: [{ label: "Also gone", href: "/c" }] },
      ]),
    ).toEqual([{ heading: "A", links: [{ label: "Shown", href: "/a" }] }]);
  });

  it("puts the policies in the Legal column", () => {
    const legal = visible.find((c) => c.heading === "Legal")?.links;
    expect(legal).toEqual([
      { label: "Terms of use", href: "/legal/terms" },
      { label: "Cookie policy", href: "/legal/cookies" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Community guidelines and review policy", href: "/legal/community-guidelines" },
    ]);
  });

  it("keeps only Cookie preferences in the bottom row, so no policy is listed twice", () => {
    expect(FOOTER_LEGAL_LINKS).toEqual([{ label: "Cookie preferences", href: "/legal/cookies" }]);

    const columnLabels = visible.flatMap((c) => c.links.map((l) => l.label));
    expect(FOOTER_LEGAL_LINKS.some((l) => columnLabels.includes(l.label))).toBe(false);
  });

  it("has the socials", () => {
    expect(FOOTER_SOCIAL_LINKS.map((s) => s.label)).toEqual(["LinkedIn", "X", "Instagram"]);
  });

  it("opens the Safety Guide page and sends safety concerns and Contact us to the team by email", () => {
    const support = visible.find((c) => c.heading === "Support");
    const href = (label: string) => support?.links.find((l) => l.label === label)?.href;

    expect(CONTACT_MAILTO).toBe("mailto:hello@myjourny.io");
    expect(href("Safety Guide")).toBe("/legal/safety");
    expect(href("Report a safety concern")).toBe(CONTACT_MAILTO);
    expect(href("Contact us")).toBe(CONTACT_MAILTO);
  });

  it("sends Become a guide to the guide sign-up page", () => {
    const hosting = visible.find((c) => c.heading === "Guiding and Curating");
    expect(hosting?.links.find((l) => l.label === "Become a guide")?.href).toBe("/become-a-guide");
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
