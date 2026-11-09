import { describe, expect, it } from "vitest";

import { cookieData } from "./cookie-data";

describe("cookieData", () => {
  it("contains Cookie Policy title, lastUpdated, and 10 table of contents items", () => {
    expect(cookieData.title).toBe("Cookie Policy");
    expect(cookieData.lastUpdated).toBe("9 November 2026");
    expect(cookieData.tableOfContents.length).toBe(10);
    expect(cookieData.tableOfContents[0].id).toBe("section-1");
    expect(cookieData.tableOfContents[9].id).toBe("section-10");
  });

  it("contains all 10 sections populated correctly", () => {
    expect(cookieData.sections.length).toBe(10);

    // Section 3: The four kinds we use (has table with 4 rows)
    const s3 = cookieData.sections.find((s) => s.id === "section-3");
    expect(s3).toBeDefined();
    expect(s3?.table?.headers).toEqual(["Type", "What it does", "Can I turn it off?"]);
    expect(s3?.table?.rows.length).toBe(4);

    // Section 4: The cookies we use (has table with 9 rows)
    const s4 = cookieData.sections.find((s) => s.id === "section-4");
    expect(s4).toBeDefined();
    expect(s4?.table?.headers).toEqual(["Name", "Type", "Set by", "What it does", "How long it lasts"]);
    expect(s4?.table?.rows.length).toBe(9);

    // Section 6: Your choices (has actionCard and bullets)
    const s6 = cookieData.sections.find((s) => s.id === "section-6");
    expect(s6).toBeDefined();
    expect(s6?.bullets?.length).toBe(5);
    expect(s6?.actionCard?.buttonText).toBe("Manage cookie preferences");
  });

  it("defines read next cards and document questions footer", () => {
    expect(cookieData.readNext?.items.length).toBe(2);
    expect(cookieData.readNext?.items[0].title).toBe("Privacy Policy");
    expect(cookieData.readNext?.items[1].title).toBe("Terms of Use");
    expect(cookieData.documentQuestions?.text).toContain("Questions about this document?");
  });
});
