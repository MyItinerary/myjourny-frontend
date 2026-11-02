import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useListingFiltersViewModel } from "./use-listing-filters-view-model";

describe("useListingFiltersViewModel", () => {
  it("opens one group at a time, picks an option and closes", () => {
    const { result } = renderHookWithProviders(() => useListingFiltersViewModel());
    expect(result.current.chips.map((c) => c.label)).toEqual(["Price", "Duration", "Time of day"]);

    act(() => result.current.onToggle("price"));
    expect(result.current.chips.find((c) => c.id === "price")?.open).toBe(true);
    act(() => result.current.onToggle("duration"));
    expect(result.current.chips.filter((c) => c.open).map((c) => c.id)).toEqual(["duration"]);

    act(() => result.current.onSelect("duration", "up-to-2h"));
    const duration = result.current.chips.find((c) => c.id === "duration")!;
    expect(duration).toMatchObject({ label: "Up to 2 hours", name: "Duration", active: true, open: false });
    expect(result.current.params).toEqual({ duration_max: 120 });
    expect(result.current.activeCount).toBe(1);
  });

  it("clears a group by picking its option again, and clears everything at once", () => {
    const { result } = renderHookWithProviders(() => useListingFiltersViewModel());

    act(() => result.current.onSelect("price", "under-5000"));
    act(() => result.current.onSelect("time", "day"));
    act(() => result.current.onSelect("price", "under-5000"));
    expect(result.current.params).toEqual({ time_of_day: "day" });

    act(() => result.current.onClearAll());
    expect(result.current.params).toEqual({});
    expect(result.current.activeCount).toBe(0);
  });
});
