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
    expect(termsData.shortVersion.items.length).toBe(5);
    expect(termsData.shortVersion.items[0].text).toContain("MyJourny is a marketplace");
  });

  it("defines the table of contents with sections and Part II", () => {
    expect(termsData.tableOfContents.length).toBeGreaterThanOrEqual(17);
    expect(termsData.tableOfContents[0].id).toBe("short-version");
    expect(termsData.tableOfContents[1].label).toBe("1. What MyJourny is, and what it is not");
    expect(termsData.tableOfContents.some((item) => item.isPartHeading)).toBe(true);
  });

  it("contains populated sections 1 through 6 with numbered paragraphs", () => {
    expect(termsData.sections.length).toBeGreaterThanOrEqual(6);
    expect(termsData.sections[0].id).toBe("section-1");
    expect(termsData.sections[0].items.length).toBe(5);
    expect(termsData.sections[1].id).toBe("section-2");
    expect(termsData.sections[2].id).toBe("section-3");
    expect(termsData.sections[3].id).toBe("section-4");
    expect(termsData.sections[4].id).toBe("section-5");
    expect(termsData.sections[5].id).toBe("section-6");
  });
});
