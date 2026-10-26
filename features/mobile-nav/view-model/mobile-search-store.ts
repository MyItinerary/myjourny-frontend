import { useSyncExternalStore } from "react";

// One phone search sheet for the whole site: the tab bar, the scrolled
// header and the "Discover locations" boxes all open the same one.
let open = false;
const listeners = new Set<() => void>();

function setOpen(next: boolean) {
  if (open === next) return;
  open = next;
  listeners.forEach((listener) => listener());
}

export function openMobileSearch() {
  setOpen(true);
}

export function closeMobileSearch() {
  setOpen(false);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMobileSearchOpen(): boolean {
  return useSyncExternalStore(subscribe, () => open, () => false);
}
