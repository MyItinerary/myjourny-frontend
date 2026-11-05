import { describe, expect, it } from "vitest";

import { safetyData } from "./safety-data";

describe("safetyData", () => {
  it("contains Safety Guide title, lastUpdated, and 16 TOC items", () => {
    expect(safetyData.title).toBe("Safety Guide");
    expect(safetyData.lastUpdated).toBe("[DATE]");
    expect(safetyData.tableOfContents.length).toBe(16);
    expect(safetyData.tableOfContents[0].label).toBe("1. How safety works on MyJourny");
    expect(safetyData.tableOfContents[15].label).toBe("16. Contact and feedback");
  });

  it("contains all 16 sections populated with text", () => {
    expect(safetyData.sections.length).toBe(16);

    // Section 1: How safety works on MyJourny
    const s1 = safetyData.sections.find((s) => s.id === "section-1");
    expect(s1).toBeDefined();
    expect(s1?.bullets?.length).toBe(4);

    // Section 12: Safe hosting checklist
    const s12 = safetyData.sections.find((s) => s.id === "section-12");
    expect(s12).toBeDefined();
    expect(s12?.items.length).toBe(4);
    expect(s12?.items[0].subheading).toBe("Before you list");
    expect(s12?.items[0].isChecklist).toBe(true);
    expect(s12?.items[3].subheading).toBe("After an incident");
    expect(s12?.items[3].isNumberedList).toBe(true);

    // Section 13: Safe event hosting checklist
    const s13 = safetyData.sections.find((s) => s.id === "section-13");
    expect(s13).toBeDefined();
    expect(s13?.items[0].isChecklist).toBe(true);

    // Section 16: Contact and feedback
    const s16 = safetyData.sections.find((s) => s.id === "section-16");
    expect(s16).toBeDefined();
    expect(s16?.bullets?.length).toBe(4);
    expect(s16?.note).toContain("We learn from every report");
  });
});
