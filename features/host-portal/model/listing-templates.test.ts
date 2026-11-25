import { describe, expect, it } from "vitest";

import { blankDraft, CATEGORIES, sectionsDone, SUBCATEGORIES } from "./listing-draft";
import { draftFromTemplate, hasContent, LISTING_TEMPLATES, templateById } from "./listing-templates";

describe("LISTING_TEMPLATES", () => {
  it("has three, each with its own id", () => {
    expect(LISTING_TEMPLATES.map((t) => t.card.id)).toEqual(["portrait-walk", "market-to-plate", "boat-morning"]);
  });

  it("uses categories and subcategories the builder offers", () => {
    for (const { fill } of LISTING_TEMPLATES) {
      for (const c of fill.cats!) expect(CATEGORIES).toContain(c);
      for (const s of fill.subs!) expect(fill.cats!.flatMap((c) => SUBCATEGORIES[c])).toContain(s);
    }
  });

  it("matches the money line on each card to the group size and price it fills in", () => {
    for (const { card, fill } of LISTING_TEMPLATES) {
      const gross = Number(fill.maxG) * Number(fill.price);
      expect(card.money).toBe(`${fill.maxG} guests × ₦${Number(fill.price).toLocaleString("en-US")} = ₦${gross.toLocaleString("en-US")}`);
    }
  });

  it("leaves where you meet, when it runs and photos to the host", () => {
    for (const { fill } of LISTING_TEMPLATES) {
      expect(fill).not.toHaveProperty("landmark");
      expect(fill).not.toHaveProperty("days");
      expect(fill).not.toHaveProperty("photos");
    }
  });
});

describe("templateById", () => {
  it("finds a template, or nothing for an id it doesn't know", () => {
    expect(templateById("boat-morning")?.card.title).toBe("Boat morning");
    expect(templateById("nope")).toBeNull();
    expect(templateById(null)).toBeNull();
  });
});

describe("draftFromTemplate", () => {
  it("fills a fresh draft, with every filled step waiting to be checked", () => {
    const d = draftFromTemplate(LISTING_TEMPLATES[0]);

    expect(d.title).toBe("Golden hour portrait walk");
    expect(d.city).toBe("Lagos");
    expect(d.editingId).toBeNull();
    expect(d.template).toBe("Golden hour portrait walk");
    expect(d.prefilled).toEqual([1, 2, 4, 5, 6, 7]);
    expect(d.checked).toEqual([]);
  });

  it("fills in enough that each checked step is done, apart from the schedule and the host's own long description", () => {
    for (const template of LISTING_TEMPLATES) {
      const d = { ...draftFromTemplate(template), checked: [1, 2, 4, 5, 6, 7] as const };
      expect(sectionsDone({ ...d, checked: [...d.checked] })).toMatchObject({ 1: false, 2: true, 4: false, 5: true, 6: true, 7: true });
    }
  });
});

describe("hasContent", () => {
  it("is false for a blank draft and true once something is in it", () => {
    expect(hasContent(blankDraft())).toBe(false);
    expect(hasContent({ ...blankDraft(), title: "Walk" })).toBe(true);
    expect(hasContent({ ...blankDraft(), photos: ["a"] })).toBe(true);
  });
});
