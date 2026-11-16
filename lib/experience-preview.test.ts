import { afterEach, describe, expect, it, vi } from "vitest";

import {
  openExperiencePreview,
  previewPath,
  previewTokenFor,
  setActivePreview,
  stripPreviewHash,
  takePreviewToken,
} from "./experience-preview";

afterEach(() => {
  setActivePreview(null);
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

describe("previewTokenFor", () => {
  it("sends the token only with requests that read the previewed experience, and quotes", () => {
    setActivePreview({ id: "exp-1", token: "tok" });
    expect(previewTokenFor("/experiences/exp-1")).toBe("tok");
    expect(previewTokenFor("/experiences/exp-1/sessions?from=2026-11-16")).toBe("tok");
    expect(previewTokenFor("/bookings/quote")).toBe("tok");
    expect(previewTokenFor("/experiences/exp-10")).toBeNull();
    expect(previewTokenFor("/experiences/exp-2/pricing")).toBeNull();
    expect(previewTokenFor("/bookings/")).toBeNull();
  });

  it("sends nothing when no preview is open", () => {
    expect(previewTokenFor("/experiences/exp-1")).toBeNull();
  });
});

describe("the token in the link", () => {
  it("is read from #t=, kept for reloads, and taken off the address bar", () => {
    window.history.replaceState(null, "", `${previewPath("exp-1", "a.b.c")}`);
    expect(takePreviewToken("exp-1")).toBe("a.b.c");

    stripPreviewHash();
    expect(window.location.hash).toBe("");
    expect(window.location.pathname).toBe("/experiences/exp-1/preview");
    // A reload has no hash left but still finds the token.
    expect(takePreviewToken("exp-1")).toBe("a.b.c");
    expect(takePreviewToken("exp-2")).toBeNull();
  });
});

describe("openExperiencePreview", () => {
  it("opens the tab at once, then sends it to the preview", async () => {
    const tab = { opener: window, location: { href: "" }, close: vi.fn() };
    const open = vi.spyOn(window, "open").mockReturnValue(tab as unknown as Window);

    await openExperiencePreview("exp-1", async () => "tok");

    expect(open).toHaveBeenCalledWith("", "_blank");
    expect(tab.opener).toBeNull();
    expect(tab.location.href).toBe("/experiences/exp-1/preview#t=tok");
  });

  it("closes the empty tab when there's no token", async () => {
    const tab = { opener: null, location: { href: "" }, close: vi.fn() };
    vi.spyOn(window, "open").mockReturnValue(tab as unknown as Window);

    await expect(openExperiencePreview("exp-1", () => Promise.reject(new Error("404")))).rejects.toThrow("404");
    expect(tab.close).toHaveBeenCalled();
  });
});
