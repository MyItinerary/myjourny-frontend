import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fromStored, useListingDraft, useSampleDraft } from "./draft-store";
import { SAMPLE_DRAFT } from "./sample-listing-draft";

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  window.localStorage.clear();
  const { result } = renderHook(() => useListingDraft());
  act(() => result.current.clear());
});

describe("useListingDraft", () => {
  it("starts blank", () => {
    const { result } = renderHook(() => useListingDraft());
    expect(result.current.draft.title).toBe("");
    expect(result.current.draft.city).toBe("Lagos");
  });

  it("keeps every change on this computer and shares it between screens", () => {
    const a = renderHook(() => useListingDraft());
    const b = renderHook(() => useListingDraft());

    act(() => a.result.current.update((d) => ({ ...d, title: "Lagos Island Photowalk" })));

    expect(b.result.current.draft.title).toBe("Lagos Island Photowalk");
    expect(JSON.parse(window.localStorage.getItem("myjourny:host-listing-draft") ?? "{}").title).toBe("Lagos Island Photowalk");
  });

  it("clears the draft", () => {
    const { result } = renderHook(() => useListingDraft());
    act(() => result.current.update((d) => ({ ...d, title: "x" })));
    act(() => result.current.clear());
    expect(result.current.draft.title).toBe("");
  });

  it("keeps the latest edit in memory when the browser won't save it, then saves once it can", () => {
    const { result } = renderHook(() => useListingDraft());
    act(() => result.current.update((d) => ({ ...d, title: "Lekki Market Walk" })));

    // Storage is full: the old draft can still be read, but nothing new saves.
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    act(() => result.current.update((d) => ({ ...d, title: "Lekki Market Food Walk" })));
    act(() => result.current.update((d) => ({ ...d, city: "Abuja" })));

    expect(result.current.draft.title).toBe("Lekki Market Food Walk");
    expect(result.current.draft.city).toBe("Abuja");

    setItem.mockRestore();
    act(() => result.current.update((d) => ({ ...d, hook: "Street food by the lagoon" })));
    const saved = JSON.parse(window.localStorage.getItem("myjourny:host-listing-draft") ?? "{}");
    expect(saved).toMatchObject({ title: "Lekki Market Food Walk", city: "Abuja", hook: "Street food by the lagoon" });
  });

  it("ignores a damaged saved draft", () => {
    window.localStorage.setItem("myjourny:host-listing-draft", "{nope");
    const { result } = renderHook(() => useListingDraft());
    expect(result.current.draft.title).toBe("");
  });
});

describe("useSampleDraft", () => {
  it("holds the sample in memory, never in storage, and clearing puts the sample back", () => {
    const { result } = renderHook(() => useSampleDraft());
    expect(result.current.draft).toBe(SAMPLE_DRAFT);

    act(() => result.current.update((d) => ({ ...d, title: "Tried something" })));
    expect(result.current.draft.title).toBe("Tried something");
    expect(window.localStorage.getItem("myjourny:host-listing-draft")).toBeNull();

    act(() => result.current.clear());
    expect(result.current.draft).toBe(SAMPLE_DRAFT);
  });
});

describe("fromStored", () => {
  it("brings a draft saved with one category and one landmark into the current shape", () => {
    const d = fromStored({ title: "Walk", cat: "Art & creativity", sub: "Photography walk", landmark: "Freedom Park", lat: 6.45, lng: 3.39 });
    expect(d).toMatchObject({ title: "Walk", cats: ["Art & creativity"], subs: ["Photography walk"], locations: [{ name: "Freedom Park", lat: 6.45, lng: 3.39 }] });
    expect(d).not.toHaveProperty("cat");
    expect(d).not.toHaveProperty("landmark");
  });

  it("drops what's left from when template steps had to be ticked", () => {
    const d = fromStored({ title: "Walk", template: "Golden hour portrait walk", prefilled: [1], checked: [] } as never);
    expect(d).not.toHaveProperty("template");
    expect(d).not.toHaveProperty("prefilled");
    expect(d).not.toHaveProperty("checked");
  });

  it("leaves a current draft as it is", () => {
    expect(fromStored({ cats: ["Water activity"], locations: [] })).toMatchObject({ cats: ["Water activity"], locations: [] });
  });
});
