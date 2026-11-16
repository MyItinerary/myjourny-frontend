import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { FOOTER_LEGAL_LINKS, FOOTER_LINK_COLUMNS, FOOTER_SOCIAL_LINKS, SAFETY_MAILTO } from "./footer-content";

describe("footer content", () => {
  it("lists the three link columns from the design in order", () => {
    expect(FOOTER_LINK_COLUMNS.map((c) => c.heading)).toEqual(["Support", "Hosting and Curating", "Myjourny"]);
    expect(FOOTER_LINK_COLUMNS.every((c) => c.links.length > 0)).toBe(true);
  });

  it("links to Experiences, with no mention of events while they're on hold", () => {
    const links = FOOTER_LINK_COLUMNS.flatMap((c) => c.links);
    expect(links).toContainEqual({ label: "Experiences", href: "/experiences" });
    expect(links.some((l) => /events/i.test(l.label) && l.href !== "#")).toBe(false);
  });

  it("has the legal links and socials", () => {
    expect(FOOTER_LEGAL_LINKS.map((l) => l.label)).toEqual(["Privacy policy", "Terms of use", "Cookie policy", "Cookie preferences"]);
    expect(FOOTER_LEGAL_LINKS.every((l) => l.href.startsWith("/legal/"))).toBe(true);
    expect(FOOTER_SOCIAL_LINKS.map((s) => s.label)).toEqual(["LinkedIn", "X", "Instagram"]);
  });

  it("opens the Safety Guide page and sends safety concerns to the team by email", () => {
    const support = FOOTER_LINK_COLUMNS.find((c) => c.heading === "Support");
    const href = (label: string) => support?.links.find((l) => l.label === label)?.href;

    expect(SAFETY_MAILTO).toBe("mailto:hello@myjourny.io");
    expect(href("Safety Guide")).toBe("/legal/safety");
    expect(href("Report a safety concern")).toBe(SAFETY_MAILTO);
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
