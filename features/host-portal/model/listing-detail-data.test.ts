import { describe, expect, it } from "vitest";

import { useHostListingDetail } from "./listing-detail-data";

describe("useHostListingDetail", () => {
  it("is empty outside the preview and for an unknown listing", () => {
    expect(useHostListingDetail("l1", null)).toBeNull();
    expect(useHostListingDetail("nope", "full")).toBeNull();
    expect(useHostListingDetail("l1", "full")?.id).toBe("l1");
  });
});
