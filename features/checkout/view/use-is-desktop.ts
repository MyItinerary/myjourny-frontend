import { useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

const canMatchMedia = () => typeof window.matchMedia === "function";

const subscribe = (onChange: () => void) => {
  if (!canMatchMedia()) return () => {};
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** Wide screens get a dropdown or dialog; phones get a bottom sheet. */
export function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => !canMatchMedia() || window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
}
