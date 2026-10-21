import { useCallback, useSyncExternalStore } from "react";

import { blankDraft } from "./listing-draft";
import type { ListingDraft } from "./listing-draft.types";

const KEY = "myjourny:host-listing-draft";
const listeners = new Set<() => void>();
const SERVER_DRAFT = blankDraft();

let cachedRaw: string | null | undefined;
let cachedDraft: ListingDraft = SERVER_DRAFT;

/** The saved draft, the same object until the stored text changes (React needs that). */
function read(): ListingDraft {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cachedDraft;
  }
  if (raw === cachedRaw) return cachedDraft;
  cachedRaw = raw;
  try {
    cachedDraft = raw ? { ...blankDraft(), ...(JSON.parse(raw) as Partial<ListingDraft>) } : SERVER_DRAFT;
  } catch {
    cachedDraft = SERVER_DRAFT;
  }
  return cachedDraft;
}

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};

function write(draft: ListingDraft | null) {
  const raw = draft ? JSON.stringify(draft) : null;
  try {
    if (raw) window.localStorage.setItem(KEY, raw);
    else window.localStorage.removeItem(KEY);
    cachedRaw = undefined;
  } catch {
    // Storage blocked: keep it in memory so the form still works this visit.
    cachedRaw = raw;
    cachedDraft = draft ?? SERVER_DRAFT;
  }
  listeners.forEach((listener) => listener());
}

/** The listing being built. Kept on this computer after every change, so closing the tab loses nothing. */
export function useListingDraft() {
  const draft = useSyncExternalStore(subscribe, read, () => SERVER_DRAFT);
  const update = useCallback((change: (current: ListingDraft) => ListingDraft) => write(change(read())), []);
  const clear = useCallback(() => write(null), []);
  return { draft, update, clear };
}
