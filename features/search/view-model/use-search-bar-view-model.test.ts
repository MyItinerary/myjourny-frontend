import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useSearchBarViewModel } from "./use-search-bar-view-model";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("useSearchBarViewModel", () => {
  it("initializes with default values", () => {
    const { result } = renderHookWithProviders(() => useSearchBarViewModel());

    expect(result.current.activeTab).toBeNull();
    expect(result.current.selectedWhere).toBe("");
    expect(result.current.selectedWhen).toBe("");
    expect(result.current.totalGuests).toBe(0);
    expect(result.current.allFieldsFilled).toBe(false);
  });

  it("advances from Where to When on destination selection", () => {
    const { result } = renderHookWithProviders(() => useSearchBarViewModel());

    act(() => {
      result.current.onSelectDestination({
        id: "lagos",
        city: "Lagos, Nigeria",
        description: "Beaches & nightlife",
      });
    });

    expect(result.current.selectedWhere).toBe("Lagos, Nigeria");
    expect(result.current.activeTab).toBe("when");
  });

  it("advances from Where to When on experience selection", () => {
    const { result } = renderHookWithProviders(() => useSearchBarViewModel());

    act(() => {
      result.current.onSelectExperience({
        id: "exp-123",
        title: "Nike Art Gallery Deep Dive",
        city: "Lagos",
      });
    });

    expect(result.current.selectedWhere).toBe("Nike Art Gallery Deep Dive");
    expect(result.current.activeTab).toBe("when");
  });

  it("advances from When to Who on date selection", () => {
    const { result } = renderHookWithProviders(() => useSearchBarViewModel());

    const pickedDate = new Date(2030, 5, 15);
    act(() => {
      result.current.onSelectDate(pickedDate, "June 15");
    });

    expect(result.current.selectedWhen).toBe("June 15");
    expect(result.current.activeTab).toBe("who");
  });

  it("updates guest counts correctly", () => {
    const { result } = renderHookWithProviders(() => useSearchBarViewModel());

    act(() => {
      result.current.incrementGuest("adults");
      result.current.incrementGuest("children");
    });

    expect(result.current.guests.adults).toBe(1);
    expect(result.current.guests.children).toBe(1);
    expect(result.current.totalGuests).toBe(2);
    expect(result.current.whoText).toContain("2 guests");

    act(() => {
      result.current.decrementGuest("adults");
    });

    expect(result.current.guests.adults).toBe(0);
    expect(result.current.totalGuests).toBe(1);
  });

  it("executes search and navigates when all criteria are met", () => {
    mockPush.mockClear();
    const { result } = renderHookWithProviders(() => useSearchBarViewModel());

    act(() => {
      result.current.onSelectExperience({
        id: "exp-123",
        title: "Nike Art Gallery Deep Dive",
      });
      result.current.onSelectDate(new Date(2030, 5, 15), "June 15");
      result.current.incrementGuest("adults");
    });

    expect(result.current.allFieldsFilled).toBe(true);

    act(() => {
      result.current.onSearch();
    });

    expect(mockPush).toHaveBeenCalledWith("/experiences/exp-123");
  });

  it("navigates to city route on destination selection", () => {
    mockPush.mockClear();
    const { result } = renderHookWithProviders(() => useSearchBarViewModel());

    act(() => {
      result.current.onSelectDestination({
        id: "lagos",
        city: "Lagos, Nigeria",
        description: "Beaches",
      });
      result.current.onSearch();
    });

    expect(mockPush).toHaveBeenCalledWith("/cities/lagos");
  });

  it("navigates to category route on activity selection", () => {
    mockPush.mockClear();
    const { result } = renderHookWithProviders(() => useSearchBarViewModel());

    act(() => {
      result.current.onSelectActivity({
        id: "street-food-markets",
        label: "Street food & markets",
        subtitle: "Local bites",
      });
      result.current.onSearch();
    });

    expect(mockPush).toHaveBeenCalledWith("/categories/street-food-markets");
  });

  it("debounces where input with timers and fetches suggestions via MSW", async () => {
    vi.useFakeTimers();

    const { result } = renderHookWithProviders(() =>
      useSearchBarViewModel({ debounceMs: 400 }),
    );

    act(() => {
      result.current.setWhereInput("Lekki");
    });

    expect(result.current.selectedWhere).toBe("Lekki");
    expect(result.current.debouncedWhere).toBe("");

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.debouncedWhere).toBe("Lekki");

    vi.useRealTimers();
  });
});
