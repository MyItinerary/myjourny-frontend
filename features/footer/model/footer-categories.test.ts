import { describe, expect, it } from "vitest";

import { useInterestCategories, useSubcategories } from "./footer-categories";

describe("footer categories model", () => {
  it("exposes the shared category hooks", () => {
    expect(typeof useInterestCategories).toBe("function");
    expect(typeof useSubcategories).toBe("function");
  });
});
