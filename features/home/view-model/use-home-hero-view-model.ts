import { useEffect, useState } from "react";

import { openMobileSearch } from "@/features/mobile-nav";
import { useSearchBarViewModel, type SearchBarViewModel } from "@/features/search";

export type HomeHeroViewModel = {
  search: SearchBarViewModel;
  /** True once the page scrolls: the nav's compact search takes over, so the hero bar fades out. */
  isScrolled: boolean;
  /** Phones open the one shared search sheet (mounted with the bottom tab bar). */
  onOpenMobileSearch: () => void;
};

export function useHomeHeroViewModel(): HomeHeroViewModel {
  const search = useSearchBarViewModel({ variant: "hero" });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { search, isScrolled, onOpenMobileSearch: openMobileSearch };
}
