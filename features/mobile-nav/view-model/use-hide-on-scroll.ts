import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Ignore jitter smaller than this (px) so a resting thumb doesn't flicker the bar. */
const THRESHOLD = 8;
/** Always show the bar within this distance (px) of the top or the end of the page. */
const EDGE = 72;

const matches = (query: string) => typeof window.matchMedia === "function" && window.matchMedia(query).matches;

/** Installed to the home screen: no browser toolbar comes and goes, so the bar stays put. */
function isStandalone() {
  return matches("(display-mode: standalone)") || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * Hides the phone bottom bar while you scroll down and brings it back as you scroll up or
 * reach the top or the end of the page, in step with the browser's own toolbar.
 */
export function useHideOnScroll(): boolean {
  const pathname = usePathname();
  // The page the bar was hidden on: moving to another page shows it again without an extra render.
  const [hiddenOn, setHiddenOn] = useState<string | null>(null);

  useEffect(() => {
    const setHidden = (hide: boolean) => setHiddenOn(hide ? pathname : null);
    if (isStandalone() || matches("(prefers-reduced-motion: reduce)")) return;

    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const nearTop = y <= EDGE;
      const nearEnd = y + window.innerHeight >= document.documentElement.scrollHeight - EDGE;
      if (nearTop || nearEnd) {
        setHidden(false);
        last = y;
        return;
      }
      if (Math.abs(y - last) < THRESHOLD) return;
      setHidden(y > last);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return hiddenOn !== null && hiddenOn === pathname;
}
