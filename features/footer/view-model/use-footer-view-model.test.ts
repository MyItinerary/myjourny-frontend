import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useFooterViewModel } from "./use-footer-view-model";

const state = vi.hoisted(() => ({
  categories: { data: undefined as unknown, isLoading: false },
  subs: { data: [] as unknown[], isLoading: false, isFetching: false },
  lastParent: null as number | null,
}));

vi.mock("../model/footer-categories", () => ({
  useInterestCategories: () => state.categories,
  useSubcategories: (id: number | null) => {
    state.lastParent = id;
    return state.subs;
  },
}));

const cat = (id: number, text: string, parent_id: number | null = null) => ({ id, text, parent_id, slug: text });

describe("useFooterViewModel", () => {
  it("shows only top-level categories as tabs and activates the first", () => {
    state.categories = { data: [cat(1, "Food"), cat(2, "Art"), cat(3, "Sub", 1)], isLoading: false };
    const { result } = renderHook(() => useFooterViewModel());
    expect(result.current.tabs).toEqual([
      { id: 1, label: "Food", active: true },
      { id: 2, label: "Art", active: false },
    ]);
    expect(state.lastParent).toBe(1);
  });

  it("switches the active tab and loads its subcategories", () => {
    state.categories = { data: [cat(1, "Food"), cat(2, "Art")], isLoading: false };
    state.subs = { data: [{ id: 9, text: "Cafés", slug: "cafes" }], isLoading: false, isFetching: false };
    const { result } = renderHook(() => useFooterViewModel());
    act(() => result.current.onSelectTab(2));
    expect(result.current.tabs[1].active).toBe(true);
    expect(state.lastParent).toBe(2);
    expect(result.current.subcategories).toEqual([{ id: 9, label: "Cafés", href: "/categories/cafes" }]);
  });

  it("reports loading while categories load", () => {
    state.categories = { data: undefined, isLoading: true };
    state.subs = { data: [], isLoading: false, isFetching: false };
    const { result } = renderHook(() => useFooterViewModel());
    expect(result.current.isLoadingTabs).toBe(true);
    expect(result.current.isLoadingSubcategories).toBe(true);
    expect(result.current.tabs).toEqual([]);
  });

  it("carries the static link content and current year", () => {
    state.categories = { data: [], isLoading: false };
    const { result } = renderHook(() => useFooterViewModel());
    expect(result.current.columns).toHaveLength(3);
    expect(result.current.year).toBe(new Date().getFullYear());
  });
});
