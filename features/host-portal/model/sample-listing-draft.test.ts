import { describe, expect, it } from "vitest";

import { DESC_MAX_WORDS, DESC_MIN_WORDS, doneCountOf, HOOK_MAX_WORDS, wordCount } from "./listing-draft";
import { SAMPLE_DRAFT } from "./sample-listing-draft";

describe("SAMPLE_DRAFT", () => {
  it("fills every required section", () => {
    expect(doneCountOf(SAMPLE_DRAFT)).toBe(8);
  });

  it("keeps both descriptions inside their word limits", () => {
    expect(wordCount(SAMPLE_DRAFT.hook)).toBeLessThanOrEqual(HOOK_MAX_WORDS);
    expect(wordCount(SAMPLE_DRAFT.desc)).toBeGreaterThanOrEqual(DESC_MIN_WORDS);
    expect(wordCount(SAMPLE_DRAFT.desc)).toBeLessThanOrEqual(DESC_MAX_WORDS);
  });

  it("is a new experience, not an edit or a template", () => {
    expect(SAMPLE_DRAFT).toMatchObject({ editingId: null, template: null, prefilled: [] });
  });
});
