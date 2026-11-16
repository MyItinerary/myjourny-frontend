import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { FOOTER_LEGAL_LINKS, FOOTER_LINK_COLUMNS, FOOTER_SOCIAL_LINKS, CONTACT_MAILTO } from "./footer-content";

describe("footer content", () => {
  const column = (heading: string) => FOOTER_LINK_COLUMNS.find((c) => c.heading === heading)?.links.map((l) => l.label);

  it("lists the Support, Hosting and Legal columns in order", () => {
    expect(FOOTER_LINK_COLUMNS.map((c) => c.heading)).toEqual(["Support", "Hosting and Curating", "Legal"]);
    expect(column("Support")).toEqual(["Safety Guide", "Report a safety concern", "Cancellation and Refund Policy", "Contact us", "Blog"]);
    expect(column("Hosting and Curating")).toEqual(["Become a host", "Host Terms"]);
  });

  it("drops the links QA asked to remove, including anything about events while they're on hold", () => {
    const labels = FOOTER_LINK_COLUMNS.flatMap((c) => c.links.map((l) => l.label));
    for (const removed of ["Payment protection", "Help Center", "Host an event", "How hosting pays", "Hosting responsibly", "Why book with us", "Experiences"]) {
      expect(labels).not.toContain(removed);
    }
    expect(labels.some((l) => /events?\b/i.test(l))).toBe(false);
  });

  it("puts the policies in the Legal column", () => {
    const legal = FOOTER_LINK_COLUMNS.find((c) => c.heading === "Legal")?.links;
    expect(legal).toEqual([
      { label: "Terms of use", href: "/legal/terms" },
      { label: "Cookie policy", href: "/legal/cookies" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Community guidelines and review policy", href: "/legal/community-guidelines" },
    ]);
  });

  it("has the legal links and socials", () => {
    expect(FOOTER_LEGAL_LINKS.map((l) => l.label)).toEqual(["Privacy policy", "Terms of use", "Cookie policy", "Cookie preferences"]);
    expect(FOOTER_LEGAL_LINKS.every((l) => l.href.startsWith("/legal/"))).toBe(true);
    expect(FOOTER_SOCIAL_LINKS.map((s) => s.label)).toEqual(["LinkedIn", "X", "Instagram"]);
  });

  it("opens the Safety Guide page and sends safety concerns and Contact us to the team by email", () => {
    const support = FOOTER_LINK_COLUMNS.find((c) => c.heading === "Support");
    const href = (label: string) => support?.links.find((l) => l.label === label)?.href;

    expect(CONTACT_MAILTO).toBe("mailto:hello@myjourny.io");
    expect(href("Safety Guide")).toBe("/legal/safety");
    expect(href("Report a safety concern")).toBe(CONTACT_MAILTO);
    expect(href("Contact us")).toBe(CONTACT_MAILTO);
  });

  it("sends Become a host to the guide sign-up page", () => {
    const hosting = FOOTER_LINK_COLUMNS.find((c) => c.heading === "Hosting and Curating");
    expect(hosting?.links.find((l) => l.label === "Become a host")?.href).toBe("/become-a-guide");
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
