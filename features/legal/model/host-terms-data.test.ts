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
    expect(hostTermsData.tableOfContents[15].label).toBe("SCHEDULE 1: MINIMUM SAFETY STANDARDS");
    expect(hostTermsData.tableOfContents[15].isPartHeading).toBe(true);
  });

  it("contains populated sections 1 through 6", () => {
    expect(hostTermsData.sections.length).toBe(6);

    // Section 1: Who can host
    const s1 = hostTermsData.sections.find((s) => s.id === "section-1");
    expect(s1).toBeDefined();
    expect(s1?.items.length).toBe(4);
    expect(s1?.items[1].text).toContain("in your own name");

    // Section 2: Our role, and yours
    const s2 = hostTermsData.sections.find((s) => s.id === "section-2");
    expect(s2).toBeDefined();
    expect(s2?.items.length).toBe(6);
    expect(s2?.items[1].boldPrefix).toBe("You are an independent host.");

    // Section 3: Your listing
    const s3 = hostTermsData.sections.find((s) => s.id === "section-3");
    expect(s3).toBeDefined();
    expect(s3?.items.length).toBe(6);

    // Section 4: Your legal and safety duties
    const s4 = hostTermsData.sections.find((s) => s.id === "section-4");
    expect(s4).toBeDefined();
    expect(s4?.items.length).toBe(8);
    expect(s4?.items[0].bullets?.length).toBe(6);

    // Section 5: Bookings and running the experience
    const s5 = hostTermsData.sections.find((s) => s.id === "section-5");
    expect(s5).toBeDefined();
    expect(s5?.items.length).toBe(6);

    // Section 6: Money
    const s6 = hostTermsData.sections.find((s) => s.id === "section-6");
    expect(s6).toBeDefined();
    expect(s6?.items.length).toBe(10);
    expect(s6?.items[3].boldPrefix).toBe("When you are paid.");
  });
});
