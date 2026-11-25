import { describe, expect, it } from "vitest";

import { hostTermsData } from "./host-terms-data";

describe("hostTermsData", () => {
  it("contains Host Terms title, lastUpdated, and agreement text", () => {
    expect(hostTermsData.title).toBe("Host Terms");
    expect(hostTermsData.lastUpdated).toBe("9 November 2026");
    expect(hostTermsData.companyAgreementText).toContain("Myjourny and Experiences LLC (RC 9460304)");
    expect(hostTermsData.agreementNoticeText).toContain("Terms of Use (Guests)");
  });

  it("contains the 6 short version summary bullets", () => {
    expect(hostTermsData.shortVersion).toBeDefined();
    expect(hostTermsData.shortVersion?.items.length).toBe(6);
    expect(hostTermsData.shortVersion?.items[0].text).toContain("You run the experience");
    expect(hostTermsData.shortVersion?.items[1].text).toContain("You keep **85%**. We take **15%**");
    expect(hostTermsData.shortVersion?.items[5].text).toBe("We never sell ranking or placement.");
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
    expect(hostTermsData.tableOfContents[25].label).toBe("SCHEDULE 2: INSURANCE BY RISK TIER");
    expect(hostTermsData.tableOfContents[26].label).toBe("SCHEDULE 3: CANCELLATION TIERS FOR EXPERIENCES");
  });

  it("contains all populated sections, Schedule 1, Schedule 2, and Schedule 3", () => {
    // 14 numbered sections + Schedule 1 header + 9 subcategories + Schedule 2 + Schedule 3 = 26 sections
    expect(hostTermsData.sections.length).toBe(26);

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

    // Schedule 1: Photography and filming
    const sPhoto = hostTermsData.sections.find((s) => s.id === "schedule-1-photo");
    expect(sPhoto).toBeDefined();
    expect(sPhoto?.bullets?.length).toBe(3);

    // Schedule 2: Insurance by risk tier
    const sched2 = hostTermsData.sections.find((s) => s.id === "schedule-2");
    expect(sched2).toBeDefined();
    expect(sched2?.eyebrow).toBe("SCHEDULE 2");
    expect(sched2?.items.length).toBe(4);
    expect(sched2?.items[0].boldPrefix).toBe("Tier 1, lower risk.");

    // Schedule 3: Cancellation tiers for experiences
    const sched3 = hostTermsData.sections.find((s) => s.id === "schedule-3");
    expect(sched3).toBeDefined();
    expect(sched3?.eyebrow).toBe("SCHEDULE 3");
    expect(sched3?.intro).toContain("You choose one");
    expect(sched3?.items.length).toBe(2);
  });
});
