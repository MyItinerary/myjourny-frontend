import { describe, expect, it } from "vitest";

import { hostTermsData } from "./host-terms-data";

describe("hostTermsData", () => {
  it("contains Host Terms title, lastUpdated, and agreement text", () => {
    expect(hostTermsData.title).toBe("Host Terms");
    expect(hostTermsData.lastUpdated).toBe("[DATE]");
    expect(hostTermsData.companyAgreementText).toContain("COMPANY LEGAL NAME");
    expect(hostTermsData.agreementNoticeText).toContain("Terms of Use (Guests)");
  });

  it("contains the 6 short version summary bullets", () => {
    expect(hostTermsData.shortVersion.items.length).toBe(6);
    expect(hostTermsData.shortVersion.items[0].text).toContain("You run the experience");
    expect(hostTermsData.shortVersion.items[1].text).toContain("You keep **85%**. We take **15%**");
    expect(hostTermsData.shortVersion.items[5].text).toBe("We never sell ranking or placement.");
  });

  it("defines table of contents with all sections and schedules", () => {
    expect(hostTermsData.tableOfContents.length).toBe(27);
    expect(hostTermsData.tableOfContents[0].id).toBe("short-version");
    expect(hostTermsData.tableOfContents[1].label).toBe("1. Who can host");
    expect(hostTermsData.tableOfContents[6].label).toBe("6. Money");
    expect(hostTermsData.tableOfContents[7].label).toBe("7. Cancellations");
    expect(hostTermsData.tableOfContents[14].label).toBe("14. Disputes and general");
    expect(hostTermsData.tableOfContents[15].label).toBe("SCHEDULE 1: MINIMUM SAFETY STANDARDS");
    expect(hostTermsData.tableOfContents[15].isPartHeading).toBe(true);
  });

  it("contains populated sections 1 through 14 and Schedule 1 standards", () => {
    // 14 numbered sections + Schedule 1 header + 8 subcategories = 23 sections
    expect(hostTermsData.sections.length).toBe(23);

    // Section 7: Cancellations
    const s7 = hostTermsData.sections.find((s) => s.id === "section-7");
    expect(s7).toBeDefined();
    expect(s7?.items.length).toBe(4);
    expect(s7?.items[2].bullets?.length).toBe(6);

    // Section 9: Data protection
    const s9 = hostTermsData.sections.find((s) => s.id === "section-9");
    expect(s9).toBeDefined();
    expect(s9?.items.length).toBe(4);
    expect(s9?.items[1].bullets?.length).toBe(5);

    // Section 11: Curators
    const s11 = hostTermsData.sections.find((s) => s.id === "section-11");
    expect(s11).toBeDefined();
    expect(s11?.items[0].text).toContain("Curators are independent people");

    // Section 12: Responsibility and indemnity
    const s12 = hostTermsData.sections.find((s) => s.id === "section-12");
    expect(s12).toBeDefined();
    expect(s12?.items[1].boldPrefix).toBe("You will pay for and defend us against");

    // Section 14: Disputes and general
    const s14 = hostTermsData.sections.find((s) => s.id === "section-14");
    expect(s14).toBeDefined();
    expect(s14?.items.length).toBe(5);

    // Schedule 1: Minimum safety standards
    const sched1 = hostTermsData.sections.find((s) => s.id === "schedule-1");
    expect(sched1).toBeDefined();
    expect(sched1?.eyebrow).toBe("SCHEDULE 1");

    // Schedule 1: Water activities
    const sWater = hostTermsData.sections.find((s) => s.id === "schedule-1-water");
    expect(sWater).toBeDefined();
    expect(sWater?.bullets?.length).toBe(7);

    // Schedule 1: Children and young people
    const sChildren = hostTermsData.sections.find((s) => s.id === "schedule-1-children");
    expect(sChildren).toBeDefined();
    expect(sChildren?.bullets?.length).toBe(4);
  });
});
