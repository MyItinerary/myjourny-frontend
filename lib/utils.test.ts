import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges conditional classes", () => {
    expect(cn("px-2", false && "hidden", "py-1")).toBe("px-2 py-1");
  });

  it("lets later Tailwind classes win conflicts", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
  });
});
