import { describe, expect, it } from "vitest";

import { FOOTER_LEGAL_LINKS, FOOTER_LINK_COLUMNS, FOOTER_SOCIAL_LINKS } from "./footer-content";

describe("footer content", () => {
  it("lists the three link columns from the design in order", () => {
    expect(FOOTER_LINK_COLUMNS.map((c) => c.heading)).toEqual(["Support", "Hosting and Curating", "Myjourny"]);
    expect(FOOTER_LINK_COLUMNS.every((c) => c.links.length > 0)).toBe(true);
  });

  it("has the legal links and socials", () => {
    expect(FOOTER_LEGAL_LINKS).toEqual(["Privacy policy", "Terms of use", "Cookie policy", "Cookie preferences"]);
    expect(FOOTER_SOCIAL_LINKS.map((s) => s.label)).toEqual(["LinkedIn", "X", "Instagram"]);
  });
});
