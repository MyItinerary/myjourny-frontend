import { describe, expect, it } from "vitest";

import { RULE_LABELS } from "./listing-detail";
import { SAMPLE_LISTING_DETAILS } from "./sample-listing-details";
import { SAMPLE_LISTINGS } from "./sample-listings";

describe("the sample details", () => {
  it("cover every non-draft listing, each with all seven rules", () => {
    const ids = SAMPLE_LISTINGS.filter((l) => l.status !== "Draft").map((l) => l.id);
    expect(Object.keys(SAMPLE_LISTING_DETAILS).sort()).toEqual(ids.sort());
    Object.values(SAMPLE_LISTING_DETAILS).forEach((d) => expect(d.rules).toHaveLength(RULE_LABELS.length));
  });

  it("only banner the listings that are not simply live", () => {
    expect(SAMPLE_LISTING_DETAILS.l1.banner).toBeUndefined();
    expect(Object.values(SAMPLE_LISTING_DETAILS).filter((d) => d.banner)).toHaveLength(6);
  });
});
