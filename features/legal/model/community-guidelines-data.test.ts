import { describe, expect, it } from "vitest";

import { communityGuidelinesData } from "./community-guidelines-data";

describe("communityGuidelinesData", () => {
  it("has correct page title and last updated string", () => {
    expect(communityGuidelinesData.title).toBe("Community Guidelines and Reviews Policy");
    expect(communityGuidelinesData.lastUpdated).toBe("[DATE]");
  });

  it("contains numbered variant short version with 5 items", () => {
    expect(communityGuidelinesData.shortVersion).toBeDefined();
    expect(communityGuidelinesData.shortVersion?.variant).toBe("numbered");
    expect(communityGuidelinesData.shortVersion?.items).toHaveLength(5);
  });

  it("includes Part A and Part B items in table of contents", () => {
    const partA = communityGuidelinesData.tableOfContents.find(
      (item) => item.label === "PART A: COMMUNITY GUIDELINES"
    );
    const partB = communityGuidelinesData.tableOfContents.find(
      (item) => item.label === "PART B: REVIEWS POLICY"
    );
    expect(partA).toBeDefined();
    expect(partA?.isPartHeading).toBe(true);
    expect(partB).toBeDefined();
    expect(partB?.isPartHeading).toBe(true);

    const a2 = communityGuidelinesData.tableOfContents.find((item) => item.id === "section-a2");
    const b14 = communityGuidelinesData.tableOfContents.find((item) => item.id === "section-b14");
    expect(a2).toBeDefined();
    expect(b14).toBeDefined();
  });

  it("includes enforcement steps in section A8", () => {
    const a8 = communityGuidelinesData.sections.find((s) => s.id === "section-a8");
    expect(a8).toBeDefined();
    expect(a8?.enforcementSteps).toHaveLength(5);
    expect(a8?.enforcementSteps?.[0].title).toBe("Reminder");
    expect(a8?.enforcementSteps?.[4].title).toBe("Remove");
    expect(a8?.enforcementSteps?.[4].isHighlighted).toBe(true);
  });

  it("contains Read Next cards and questions box", () => {
    expect(communityGuidelinesData.readNext?.items).toHaveLength(3);
    expect(communityGuidelinesData.documentQuestions).toBeDefined();
  });
});
