import { useCallback, useSyncExternalStore } from "react";

import { blankDraft } from "./listing-draft";
import type { ListingDraft } from "./listing-draft.types";
import { SAMPLE_DRAFT } from "./sample-listing-draft";

const KEY = "myjourny:host-listing-draft";
const listeners = new Set<() => void>();
const SERVER_DRAFT = blankDraft();

let cachedRaw: string | null | undefined;
let cachedDraft: ListingDraft = SERVER_DRAFT;
// True after a write the browser refused: the draft in memory is newer than
// the stored one, so reads keep it until a write succeeds again.
let memoryOnly = false;

/** A draft saved before a host could pick more than one category held `cat` and `sub`, and
 * before more than one location, `landmark`, `lat` and `lng`. */
type StoredDraft = Partial<ListingDraft> & { cat?: string; sub?: string; landmark?: string; lat?: number | null; lng?: number | null };

/** A saved draft, filled out to the current shape. */
export function fromStored({ cat, sub, landmark, lat, lng, ...saved }: StoredDraft): ListingDraft {
  return {
    ...blankDraft(),
    ...(cat ? { cats: [cat], subs: sub ? [sub] : [] } : {}),
    ...(landmark ? { locations: [{ name: landmark, lat: lat ?? null, lng: lng ?? null }] } : {}),
    ...saved,
  };
}

/** The saved draft, the same object until the stored text changes (React needs that). */
function read(): ListingDraft {
  if (memoryOnly) return cachedDraft;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cachedDraft;
  }
  if (raw === cachedRaw) return cachedDraft;
  cachedRaw = raw;
  try {
    cachedDraft = raw ? fromStored(JSON.parse(raw) as StoredDraft) : SERVER_DRAFT;
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
    memoryOnly = false;
  } catch {
    // Storage blocked or full: keep it in memory so the form still works this visit.
    memoryOnly = true;
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

// The design's sample experience, for the "Filled" preview. Kept in memory
// only, so trying things on it never touches the host's own saved draft.
const sampleListeners = new Set<() => void>();
let sampleDraft: ListingDraft = SAMPLE_DRAFT;
const subscribeSample = (onChange: () => void) => {
  sampleListeners.add(onChange);
  return () => {
    sampleListeners.delete(onChange);
  };
};
const readSample = () => sampleDraft;
function writeSample(draft: ListingDraft | null) {
  sampleDraft = draft ?? SAMPLE_DRAFT;
  sampleListeners.forEach((listener) => listener());
}

/** The sample experience, with the same shape as `useListingDraft`. Clearing puts the sample back. */
export function useSampleDraft() {
  const draft = useSyncExternalStore(subscribeSample, readSample, readSample);
  const update = useCallback((change: (current: ListingDraft) => ListingDraft) => writeSample(change(sampleDraft)), []);
  const clear = useCallback(() => writeSample(null), []);
  return { draft, update, clear };
}
