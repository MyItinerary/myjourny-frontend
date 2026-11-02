import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useHomeHeroViewModel } from "./use-home-hero-view-model";

const openMobileSearch = vi.hoisted(() => vi.fn());
vi.mock("@/features/mobile-nav", () => ({ openMobileSearch }));
vi.mock("@/features/search", () => ({ useSearchBarViewModel: () => ({ variant: "hero" }) }));

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  window.dispatchEvent(new Event("scroll"));
}

describe("useHomeHeroViewModel", () => {
  it("flags the page as scrolled once it moves past the top, and clears it on return", () => {
    scrollTo(0);
    const { result } = renderHookWithProviders(() => useHomeHeroViewModel());
    expect(result.current.isScrolled).toBe(false);

    act(() => scrollTo(200));
    expect(result.current.isScrolled).toBe(true);

    act(() => scrollTo(0));
    expect(result.current.isScrolled).toBe(false);
  });

  it("opens the shared phone search sheet", () => {
    const { result } = renderHookWithProviders(() => useHomeHeroViewModel());

    result.current.onOpenMobileSearch();

    expect(openMobileSearch).toHaveBeenCalledOnce();
  });
});
