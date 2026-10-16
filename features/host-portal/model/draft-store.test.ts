import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useListingDraft } from "./draft-store";

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

  it("ignores a damaged saved draft", () => {
    window.localStorage.setItem("myjourny:host-listing-draft", "{nope");
    const { result } = renderHook(() => useListingDraft());
    expect(result.current.draft.title).toBe("");
  });
});
