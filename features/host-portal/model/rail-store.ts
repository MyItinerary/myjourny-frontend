import { useCallback, useSyncExternalStore } from "react";

const KEY = "myjourny:host-rail-open";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== "closed";
  } catch {
    return true;
  }
}

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};

function write(open: boolean) {
  try {
    window.localStorage.setItem(KEY, open ? "open" : "closed");
  } catch {
    // Storage blocked: the rail still toggles for this visit, from the next render of every listener.
  }
  listeners.forEach((listener) => listener());
}

/** Whether the rail is expanded. Remembered across visits; open by default. */
export function useRailOpen(): [boolean, () => void] {
  const open = useSyncExternalStore(subscribe, read, () => true);
  const toggle = useCallback(() => write(!read()), []);
  return [open, toggle];
}
