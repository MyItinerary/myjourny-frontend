import { useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

export type PreviewMode = "full" | null;

const KEY = "myjourny:host-preview";
const listeners = new Set<() => void>();

const readStored = (): PreviewMode => {
  try {
    return window.localStorage.getItem(KEY) === "full" ? "full" : null;
  } catch {
    return null;
  }
};

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** Remember the preview choice, so it follows the host from page to page. */
export function setStoredPreview(mode: PreviewMode) {
  try {
    if (mode) window.localStorage.setItem(KEY, mode);
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the choice lasts only as long as the address says so.
  }
  listeners.forEach((listener) => listener());
}

/** Which preview the portal is showing while the design is reviewed: "full"
 * for the design's sample host, or null for a host with nothing yet.
 * `?preview=full` in the address turns it on and is remembered; the switch in
 * the corner changes it. Only development builds look at this. */
export function usePreviewMode(): PreviewMode {
  const fromUrl = useSearchParams().get("preview") === "full";
  const stored = useSyncExternalStore(subscribe, readStored, () => null);

  useEffect(() => {
    if (fromUrl && readStored() !== "full") setStoredPreview("full");
  }, [fromUrl]);

  return fromUrl || stored === "full" ? "full" : null;
}
