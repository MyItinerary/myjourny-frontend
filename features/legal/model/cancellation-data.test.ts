import { describe, expect, it } from "vitest";

import { cancellationData } from "./cancellation-data";

describe("cancellationData", () => {
  it("contains the Cancellation and Refund Policy title and intro", () => {
    expect(cancellationData.title).toBe("Cancellation and Refund Policy");
    expect(cancellationData.lastUpdated).toBe("9 November 2026");
    expect(cancellationData.companyAgreementText).toContain("This policy is part of our Terms of Use.");
  });

  it("contains the 5 short version summary bullets", () => {
    expect(cancellationData.shortVersion).toBeDefined();
    expect(cancellationData.shortVersion?.items.length).toBe(5);
    expect(cancellationData.shortVersion?.items[0].text).toContain("cancellation policy with exact dates and amounts");
    expect(cancellationData.shortVersion?.items[1].text).toContain("If a host cancels, you get a **full refund**");
  });

  it("defines table of contents items matching the sections", () => {
    expect(cancellationData.tableOfContents.length).toBe(9);
    expect(cancellationData.tableOfContents[0].id).toBe("short-version");
    expect(cancellationData.tableOfContents[1].label).toBe("1. How cancellation works");
    expect(cancellationData.tableOfContents[8].label).toBe("8. For hosts");
  });

  it("contains all 8 cancellation sections populated with text", () => {
    expect(cancellationData.sections.length).toBe(8);

    // Section 1: How cancellation works
    const s1 = cancellationData.sections.find((s) => s.id === "section-1");
    expect(s1).toBeDefined();
    expect(s1?.items.length).toBe(3);
    expect(s1?.items[2].text).toContain("full price you paid");

    // Section 2: Changes, grace period, and late bookings
    const s2 = cancellationData.sections.find((s) => s.id === "section-2");
    expect(s2).toBeDefined();
    expect(s2?.items.length).toBe(5);
    expect(s2?.items[3].boldPrefix).toBe("24-hour grace period.");

    // Section 3: Events and tickets
    const s3 = cancellationData.sections.find((s) => s.id === "section-3");
    expect(s3).toBeDefined();
    expect(s3?.items.length).toBe(10);

    // Section 4: When you always get a refund or a choice
    const s4 = cancellationData.sections.find((s) => s.id === "section-4");
    expect(s4).toBeDefined();
    expect(s4?.items.length).toBe(6);
    expect(s4?.intro).toContain("These rules apply to every booking");

    // Section 5: What is not refundable
    const s5 = cancellationData.sections.find((s) => s.id === "section-5");
    expect(s5).toBeDefined();
    expect(s5?.items.length).toBe(4);

    // Section 6: How refunds are paid
    const s6 = cancellationData.sections.find((s) => s.id === "section-6");
    expect(s6).toBeDefined();
    expect(s6?.items.length).toBe(4);

    // Section 7: How to ask
    const s7 = cancellationData.sections.find((s) => s.id === "section-7");
    expect(s7).toBeDefined();
    expect(s7?.items.length).toBe(3);

    // Section 8: For hosts
    const s8 = cancellationData.sections.find((s) => s.id === "section-8");
    expect(s8).toBeDefined();
    expect(s8?.items.length).toBe(4);
  });
});
