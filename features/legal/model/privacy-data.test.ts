import { describe, expect, it } from "vitest";

import { privacyData } from "./privacy-data";

describe("privacyData", () => {
  it("contains Privacy Policy title and At a glance items", () => {
    expect(privacyData.title).toBe("Privacy Policy");
    expect(privacyData.lastUpdated).toBe("9 November 2026");
    expect(privacyData.atAGlance).toBeDefined();
    expect(privacyData.atAGlance?.items.length).toBe(8);
    expect(privacyData.atAGlance?.items[0].question).toBe("Who is responsible for your data?");
    expect(privacyData.atAGlance?.items[3].answer).toBe("No. We never sell it.");
  });

  it("defines table of contents with all 16 sections and at-a-glance", () => {
    expect(privacyData.tableOfContents.length).toBe(17);
    expect(privacyData.tableOfContents[0].id).toBe("at-a-glance");
    expect(privacyData.tableOfContents[1].label).toBe("1. Who we are");
    expect(privacyData.tableOfContents[4].label).toBe("4. Why we use your data, and our legal basis");
    expect(privacyData.tableOfContents[9].label).toBe("9. How long we keep your data");
    expect(privacyData.tableOfContents[16].label).toBe("16. Contact us");
  });

  it("contains all 16 populated sections", () => {
    expect(privacyData.sections.length).toBe(16);

    // Section 1: Who we are
    const s1 = privacyData.sections.find((s) => s.id === "section-1");
    expect(s1).toBeDefined();
    expect(s1?.items.length).toBe(3);

    // Section 4: Table with 12 rows
    const s4 = privacyData.sections.find((s) => s.id === "section-4");
    expect(s4).toBeDefined();
    expect(s4?.table?.headers).toEqual(["What we do", "The data we use", "Our legal basis"]);
    expect(s4?.table?.rows.length).toBe(12);

    // Section 7: Share with others
    const s7 = privacyData.sections.find((s) => s.id === "section-7");
    expect(s7).toBeDefined();
    expect(s7?.bullets?.length).toBe(7);

    // Section 9: Data retention table with 10 rows
    const s9 = privacyData.sections.find((s) => s.id === "section-9");
    expect(s9).toBeDefined();
    expect(s9?.table?.headers).toEqual(["Data", "How long we keep it"]);
    expect(s9?.table?.rows.length).toBe(10);

    // Section 10: Your rights
    const s10 = privacyData.sections.find((s) => s.id === "section-10");
    expect(s10).toBeDefined();
    expect(s10?.bullets?.length).toBe(9);
    expect(s10?.items.length).toBe(2);

    // Section 16: Contact us
    const s16 = privacyData.sections.find((s) => s.id === "section-16");
    expect(s16).toBeDefined();
    expect(s16?.items.length).toBe(2);
  });
});
