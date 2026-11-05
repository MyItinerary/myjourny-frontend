import { describe, expect, it } from "vitest";

import { termsData } from "./terms-data";

describe("termsData", () => {
  it("contains the Terms of Use title and lastUpdated placeholder", () => {
    expect(termsData.title).toBe("Terms of Use");
    expect(termsData.lastUpdated).toBe("[DATE]");
    expect(termsData.companyAgreementText).toContain("COMPANY LEGAL NAME");
    expect(termsData.agreementNoticeText).toContain("Privacy Policy");
  });

  it("contains the short version summary bullets", () => {
    expect(termsData.shortVersion).toBeDefined();
    expect(termsData.shortVersion?.items.length).toBe(5);
    expect(termsData.shortVersion?.items[0].text).toContain("MyJourny is a marketplace");
  });

  it("defines all table of contents items including Part II", () => {
    expect(termsData.tableOfContents.length).toBe(18);
    expect(termsData.tableOfContents[0].id).toBe("short-version");
    expect(termsData.tableOfContents[1].label).toBe("1. What MyJourny is, and what it is not");
    expect(termsData.tableOfContents[17].id).toBe("part-b");
    expect(termsData.tableOfContents[17].isPartHeading).toBe(true);
  });

  it("contains all 16 terms sections plus Part B populated with text", () => {
    expect(termsData.sections.length).toBe(17);

    // Section 7: Safety and risk
    const s7 = termsData.sections.find((s) => s.id === "section-7");
    expect(s7).toBeDefined();
    expect(s7?.items.length).toBe(5);

    // Section 11: Acceptable use with bullets
    const s11 = termsData.sections.find((s) => s.id === "section-11");
    expect(s11).toBeDefined();
    expect(s11?.intro).toBe("You must not:");
    expect(s11?.bullets?.length).toBe(7);

    // Section 13: Liability
    const s13 = termsData.sections.find((s) => s.id === "section-13");
    expect(s13).toBeDefined();
    expect(s13?.items[2].boldPrefix).toContain("Nothing in these terms limits liability");

    // Section 16: General
    const s16 = termsData.sections.find((s) => s.id === "section-16");
    expect(s16).toBeDefined();
    expect(s16?.items.length).toBe(5);

    // Part B: Events and tickets
    const partB = termsData.sections.find((s) => s.id === "part-b");
    expect(partB).toBeDefined();
    expect(partB?.eyebrow).toBe("PART B");
    expect(partB?.items.length).toBe(10);
  });
});
