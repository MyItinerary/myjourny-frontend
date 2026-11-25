import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";

import { useListingDraft, useSampleDraft } from "../model/draft-store";
import { useHostAccess } from "../model/host-access";
import { fetchListingForEdit, uploadPhoto, useInterestTree, usePlaceSearch, useSaveListing } from "../model/listing-builder-api";
import {
  ACCESS_OPTIONS,
  AGE_POLICIES,
  awaitingCheck,
  isPinned,
  firstUnwritten,
  subcategoryGroups,
  BOOKING_TYPES,
  CANCEL_TIERS,
  cancelTierOf,
  CATEGORIES,
  checklistFor,
  COMMISSION_PERCENT,
  DIETS,
  doneCountOf,
  EVERY_OPTIONS,
  FITNESS_LEVELS,
  formatTime,
  furthestStep,
  needsAge,
  photoHint,
  photoLabel,
  priceBreakdown,
  REFUND_POLICIES,
  sectionsDone,
  slotSummary,
  STEP_LABELS,
  SUBCATEGORIES,
  TAGS,
  timeChoices,
  timeRange,
  upcomingDates,
  WEEK_DAYS,
  WHEN_TYPES,
  wordCount,
  capWords,
  DESC_MAX_WORDS,
  HOOK_MAX_WORDS,
  wordCountLine,
  descShortBy,
} from "../model/listing-draft";
import type {
  Accessibility,
  AgePolicy,
  BookingType,
  BuilderStep,
  BasicsField,
  BuilderStepNumber,
  ChecklistItem,
  Choice,
  FitnessLevel,
  ListingDraft,
  ListKey,
  PlaceResult,
  PriceBreakdown,
  RefundPolicy,
  ToggleKey,
} from "../model/listing-draft.types";
import { draftFromExperience, privatePrice, toExperiencePayload } from "../model/listing-payload";
import { draftFromTemplate, hasContent, templateById } from "../model/listing-templates";
import { HOST_PORTAL_BASE } from "../model/nav";
import { POPULAR_LOCATIONS } from "../model/popular-locations";
import type { HostPageHeader } from "./use-host-home-view-model";
import { usePreviewMode } from "./use-preview-mode";
import { useToday } from "./use-today";

export type BuilderOptions = {
  categories: readonly string[];
  /** Each category picked, with its subcategories. */
  subGroups: { category: string; subs: string[] }[];
  tags: string[];
  diets: string[];
  weekDays: string[];
  whenTypes: typeof WHEN_TYPES;
  everyOptions: typeof EVERY_OPTIONS;
  fitnessLevels: Choice<FitnessLevel>[];
  agePolicies: Choice<AgePolicy>[];
  accessOptions: Choice<Accessibility>[];
  refundPolicies: Choice<RefundPolicy>[];
};

export type HostListingBuilderViewModel = {
  header: HostPageHeader;
  steps: BuilderStep[];
  step: BuilderStepNumber;
  doneCount: number;
  /** The mobile "All steps" sheet. */
  sheet: { open: boolean; onToggle: () => void };
  /** Step bar copy for the current step. */
  stepBar: { eyebrow: string; title: string; attention: string | null; canPrev: boolean; canNext: boolean };
  onStep: (step: number) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  /** False while this step was filled in by a template and the host hasn't checked it. */
  canContinue: boolean;
  /** The "I've checked this" box, on a step a template filled in. */
  check: { note: string; checked: boolean; onToggle: () => void } | null;
  onSaveLater: () => void;
  onPublish: () => void;
  canPublish: boolean;
  /** Publishing or saving right now. */
  publishing: boolean;
  /** Why this guide can't publish yet, if they can't. */
  publishBlock: string | null;
  /** Editing a listing that's already in itin. */
  editing: boolean;
  /** Fetching the listing being edited. */
  loadingListing: boolean;
  /** Photos still uploading. */
  uploading: number;
  draft: ListingDraft;
  options: BuilderOptions;
  /** Text and number fields. */
  onField: <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => void;
  /** The first step's field last clicked into, so its writing tip shows. It stays after the host
   * clicks away, so they can copy from it. Null until they've clicked into one. */
  tip: BasicsField | null;
  onFocusField: (field: BasicsField) => void;
  /** The "why categories and tags matter" card, once the host has spent two minutes on that step. */
  categoryTip: boolean;
  onToggle: (key: ToggleKey, value: string) => void;
  /** Picks or unpicks a category; unpicking drops its subcategories too. */
  onPickCategory: (category: string) => void;
  onListSet: (key: ListKey, index: number, value: string) => void;
  onListAdd: (key: ListKey) => void;
  onListDel: (key: ListKey, index: number) => void;
  onAddPhotos: (files: File[]) => void;
  onMeetPhoto: (file: File | undefined) => void;
  onMovePhoto: (index: number, direction: -1 | 1) => void;
  onDeletePhoto: (index: number) => void;
  /** How guests book and what happens if they cancel. */
  booking: {
    types: { key: BookingType; label: string; sub: string; selected: boolean }[];
    tiers: { key: string; label: string; sub: string; selected: boolean; saveable: boolean }[];
    /** What guests will read for the policy picked, or empty. */
    promise: string;
    /** Why part of this step is not saved, or empty. */
    unsaved: string;
    onType: (type: BookingType) => void;
    onTier: (key: string) => void;
  };
  /** Bringing in reviews from other places. */
  reviews: {
    platforms: string[];
    selected: string;
    url: string;
    urlPlaceholder: string;
    canImport: boolean;
    onSelect: (platform: string) => void;
    onUrl: (url: string) => void;
    onImport: () => void;
  };
  /** The private group option on the price step. */
  privateGroup: { on: boolean; onChange: (on: boolean) => void };
  place: {
    query: string;
    /** The search's dropdown is showing: results, or the offer to use what was typed. */
    open: boolean;
    /** Places matching what's typed, each marked when it's already picked. */
    results: (PlaceResult & { picked: boolean })[];
    /** Searched, and nothing matched. */
    noMatch: boolean;
    /** The locations picked, in order, each with a close button. */
    selected: { key: string; name: string; pinned: boolean; onRemove: () => void }[];
    /** Popular places not picked yet, to pick without searching. */
    suggestions: { key: string; name: string; onPick: () => void }[];
    /** Some locations are picked but none is on the map. */
    needsPin: boolean;
    onQuery: (query: string) => void;
    onOpen: () => void;
    onClose: () => void;
    /** Picks a search result, or unpicks it when it's already picked. The dropdown stays open for more. */
    onToggle: (place: PlaceResult) => void;
    /** Adds what was typed, with no pin. */
    onUseTyped: () => void;
  };
  derived: {
    titleCount: number;
    descWords: number;
    /** "40 of 100 words" */
    hookCount: string;
    /** "120 of 1,000 words" */
    descCount: string;
    /** Why the long description isn't long enough yet. */
    descError: string | null;
    upcoming: string[];
    slotSummary: string;
    /** Start time picker helpers. */
    times: { choices: (current: string) => string[]; format: (time: string) => string; range: (start: string) => string };
    price: PriceBreakdown;
    commissionPercent: number;
    photoLabel: string;
    photoHint: string;
    checklist: ChecklistItem[];
    /** The age box shows for these policies. */
    needsAge: boolean;
  };
};

const LISTINGS = `${HOST_PORTAL_BASE}/listings`;
/** Reviews are optional and sit just before the last look. */
const REVIEWS_STEP = 9;
const BOOKING_STEP = 10;
/** The same place: same name and the same pin. */
const samePlace = (a: { name: string; lat: number | null; lng: number | null }, b: { name: string; lat: number; lng: number }) =>
  a.name === b.name.slice(0, 120) && a.lat === b.lat && a.lng === b.lng;
const CATEGORY_STEP = 2;
const CATEGORY_TIP_DELAY_MS = 2 * 60 * 1000;
type WordLimited = "hook" | "desc";
const WORD_LIMITS: Record<WordLimited, number> = { hook: HOOK_MAX_WORDS, desc: DESC_MAX_WORDS };
const REVIEW_STEP = 11;
const REVIEW_PLATFORMS = ["Google", "TripAdvisor", "Facebook", "Instagram"];
const REVIEW_LINK_HINTS: Record<string, string> = {
  Google: "Paste your Google Maps or business link",
  TripAdvisor: "Paste your TripAdvisor page link",
  Facebook: "Paste your Facebook page link",
  Instagram: "Paste your Instagram profile link",
};
const NOT_APPROVED = "You can publish once your guide application is approved.";

/** What itin said was wrong, in a sentence. A publish missing details answers
 * with { message, missing } rather than a string. */
function publishError(error: unknown): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (detail && typeof detail === "object" && !Array.isArray(detail) && "message" in detail) return String(detail.message);
  return apiErrorMessage(error, "Couldn't publish the experience. Please try again.");
}

/** Waits until typing stops for a moment. */
function useDebounced(value: string, ms: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
}

export function useHostListingBuilderViewModel(): HostListingBuilderViewModel {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");
  const templateId = params.get("template");
  const stored = useListingDraft();
  const sampleStore = useSampleDraft();
  // The corner switch's "Filled" preview shows the design's sample experience.
  const sample = usePreviewMode() === "full" && process.env.NODE_ENV !== "production" && !editId;
  const { draft, update, clear } = sample ? sampleStore : stored;
  const today = useToday();
  const access = useHostAccess();
  const { tree, ready: treeReady } = useInterestTree();
  const save = useSaveListing();
  const [step, setStep] = useState<BuilderStepNumber>(1);
  const [query, setQuery] = useState("");
  const [placeOpen, setPlaceOpen] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [tip, setTip] = useState<BasicsField | null>(null);
  // Each move between steps is a new visit. The category tip belongs to the visit it waited through.
  const [visit, setVisit] = useState(0);
  const [tipVisit, setTipVisit] = useState(-1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bookingType, setBookingType] = useState<BookingType | "">("");
  const [reviewPlatform, setReviewPlatform] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [privateChoice, setPrivateChoice] = useState<boolean | null>(null);
  const [visited, setVisited] = useState<ReadonlySet<number>>(() => new Set([1]));

  // Editing: load the listing into the draft once, unless this draft already is it.
  const loadForEdit = Boolean(editId) && draft.editingId !== editId;
  const listing = useQuery({
    queryKey: ["guide", "experiences", editId, "edit"],
    queryFn: () => fetchListingForEdit(editId!),
    // Categories first, so the listing's category can be named in the picker.
    enabled: loadForEdit && treeReady,
  });
  useEffect(() => {
    if (loadForEdit && listing.data) update(() => draftFromExperience(listing.data.experience, tree, listing.data.prices));
  }, [loadForEdit, listing.data, tree, update]);
  // A new listing never starts from an edit that wasn't finished.
  useEffect(() => {
    if (!editId && draft.editingId) clear();
  }, [editId, draft.editingId, clear]);

  // Starting from a template: fill in a fresh draft once, then drop it from the
  // address so a reload doesn't fill it in again. A draft in progress can be
  // brought back.
  const appliedTemplate = useRef<string | null>(null);
  useEffect(() => {
    if (editId || !templateId || appliedTemplate.current === templateId) return;
    appliedTemplate.current = templateId;
    router.replace(`${LISTINGS}/new`);
    const template = templateById(templateId);
    if (!template) return;
    let previous: ListingDraft | null = null;
    update((current) => {
      previous = current;
      return draftFromTemplate(template);
    });
    const replaced = previous as ListingDraft | null;
    if (replaced && hasContent(replaced) && !replaced.editingId) {
      toast(`Started from "${template.card.title}". It replaced the draft you had.`, {
        action: { label: "Bring it back", onClick: () => update(() => replaced) },
      });
    }
  }, [editId, templateId, router, update]);

  const childrenOf = (category: string) =>
    tree.length ? (tree.find((c) => c.text === category)?.children ?? []).map((c) => c.text) : (SUBCATEGORIES[category] ?? []);
  const subGroups = subcategoryGroups(draft.cats, childrenOf);
  const subsAvailable = subGroups.length > 0;
  const done = sectionsDone(draft, subsAvailable);
  const doneCount = doneCountOf(draft, subsAvailable);
  const publishBlock = access === "approved" ? null : NOT_APPROVED;
  const canPublish = doneCount === 8 && !publishBlock && !save.isPending && uploading === 0;

  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) =>
    update((d) => ({ ...d, [key]: key in WORD_LIMITS ? capWords(value as string, WORD_LIMITS[key as WordLimited]) : value }));
  // A step a template filled in has to be checked before the host can move past it.
  // The title and both descriptions come first: nothing past step 1 until they're written.
  // The title, descriptions, categories and tags come first: nothing past them until they're filled in.
  const furthest = Math.min(firstUnwritten(draft, subsAvailable), furthestStep(draft)) as BuilderStepNumber;
  const waiting = awaitingCheck(draft, step);
  const go = useCallback((n: number) => {
    const next = Math.min(furthest, Math.max(1, n)) as BuilderStepNumber;
    setStep(next);
    setVisit((v) => v + 1);
    setSheetOpen(false);
    setVisited((seen) => (seen.has(next) ? seen : new Set(seen).add(next)));
  }, [furthest]);
  // Someone still on the category step after two minutes may be stuck: offer the tip.
  useEffect(() => {
    if (step !== CATEGORY_STEP) return;
    const timer = setTimeout(() => setTipVisit(visit), CATEGORY_TIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [step, visit]);
  // Alt+Up and Alt+Down move between steps.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
      e.preventDefault();
      go(step + (e.key === "ArrowDown" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, go]);

  const typing = query.trim().length > 0;
  const searchFor = useDebounced(typing ? query : "", 400);
  // Anywhere in Nigeria: the city comes from the place picked, not the other way round.
  const search = usePlaceSearch(searchFor, "");
  const results = typing && searchFor === query ? (search.data ?? []) : [];
  const searched = typing && searchFor === query && (search.isSuccess || search.isError || query.trim().length < 3);

  /** Picks a place, or unpicks it when it's already picked. The first place picked says which
   * city and area the experience is in. */
  const togglePlace = (place: PlaceResult) =>
    update((d) => {
      if (d.locations.some((l) => samePlace(l, place))) return { ...d, locations: d.locations.filter((l) => !samePlace(l, place)) };
      const first = d.locations.length === 0;
      return {
        ...d,
        locations: [...d.locations, { name: place.name.slice(0, 120), lat: place.lat, lng: place.lng }],
        ...(first ? { city: place.city ?? d.city, area: place.district ?? d.area } : {}),
      };
    });

  // Photos go to Cloudinary as soon as they're picked; the draft keeps their
  // links, in the order they were picked.
  const upload = async (files: File[], onDone: (urls: string[]) => void) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setUploading((n) => n + images.length);
    const urls = await Promise.all(
      images.map(async (file) => {
        try {
          return await uploadPhoto(file);
        } catch {
          toast.error(`Couldn't upload ${file.name}. Please try again.`);
          return null;
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
    const uploaded = urls.filter((url): url is string => url !== null);
    if (uploaded.length) onDone(uploaded);
  };

  const publish = () => {
    if (sample) {
      toast.info("This is the sample experience, so nothing was published.");
      return;
    }
    if (!canPublish || !today) return;
    const editing = Boolean(draft.editingId);
    save.mutate(
      { id: draft.editingId, payload: toExperiencePayload(draft, tree, today), price: Number(draft.price), privatePrice: privatePrice(draft) },
      {
        onSuccess: () => {
          clear();
          toast.success(editing ? "Your changes are live" : "Your experience is live");
          router.push(LISTINGS);
        },
        onError: (error) => toast.error(publishError(error)),
      },
    );
  };

  const categories = tree.length ? tree.map((c) => c.text) : CATEGORIES;
  const editing = Boolean(draft.editingId);
  const missing = new Map(checklistFor(draft, subsAvailable).filter((c) => !c.ok).map((c) => [c.step, c.label]));
  const steps: BuilderStep[] = STEP_LABELS.map((label, i) => {
    const n = (i + 1) as BuilderStepNumber;
    const locked = n === REVIEW_STEP && doneCount < 8;
    return {
      n,
      label,
      done: n === REVIEW_STEP ? canPublish : n === REVIEWS_STEP ? false : n === BOOKING_STEP ? cancelTierOf(draft) !== "" : done[n],
      active: n === step,
      locked,
      blocked: n > furthest,
      attention: n <= 8 && n !== step && visited.has(n) ? (missing.get(n) ?? null) : null,
      sub: locked ? "Finish the required steps" : "",
    };
  });

  return {
    header: {
      title: draft.title.trim() || (editing || editId ? "Your experience" : "Your new experience"),
      chip: editing ? "Editing" : "Draft",
      subtitle: editing ? "Your changes go live when you publish them." : "Everything you type is kept on this computer.",
      // The step nav opens the review; there's no shortcut in the header.
      actions: [],
    },
    steps,
    step,
    doneCount,
    sheet: { open: sheetOpen, onToggle: () => setSheetOpen((open) => !open) },
    stepBar: {
      eyebrow: `Step ${step} of ${STEP_LABELS.length}`,
      title: STEP_LABELS[step - 1],
      attention: steps[step - 1].attention,
      canPrev: step > 1,
      canNext: step < REVIEW_STEP && step < furthest,
    },
    onStep: go,
    onBack: () => go(step - 1),
    onNext: () => go(step + 1),
    nextLabel: step === BOOKING_STEP ? "Review and publish" : "Continue",
    canContinue: step < furthest,
    check: draft.prefilled.includes(step)
      ? {
          note: `We filled this in from the "${draft.template}" template. Change anything that isn't true for your experience, then tick the box to carry on.`,
          checked: !waiting,
          onToggle: () =>
            update((d) => ({
              ...d,
              checked: d.checked.includes(step) ? d.checked.filter((n) => n !== step) : [...d.checked, step],
            })),
        }
      : null,
    onSaveLater: () => {
      toast.success("Saved. Pick it up again from Experiences.");
      router.push(LISTINGS);
    },
    onPublish: publish,
    canPublish,
    publishing: save.isPending,
    publishBlock,
    editing,
    loadingListing: loadForEdit && !listing.isError,
    uploading,
    draft,
    options: {
      categories,
      subGroups,
      tags: TAGS,
      diets: DIETS,
      weekDays: WEEK_DAYS,
      whenTypes: WHEN_TYPES,
      everyOptions: EVERY_OPTIONS,
      fitnessLevels: FITNESS_LEVELS,
      agePolicies: AGE_POLICIES,
      accessOptions: ACCESS_OPTIONS,
      refundPolicies: REFUND_POLICIES,
    },
    onField: set,
    tip,
    onFocusField: setTip,
    categoryTip: step === CATEGORY_STEP && tipVisit === visit,
    onToggle: (key, value) =>
      update((d) => ({ ...d, [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value] })),
    onPickCategory: (category) =>
      update((d) => {
        if (!d.cats.includes(category)) return { ...d, cats: [...d.cats, category] };
        const dropped = new Set(childrenOf(category));
        return { ...d, cats: d.cats.filter((c) => c !== category), subs: d.subs.filter((s) => !dropped.has(s)) };
      }),
    onListSet: (key, index, value) => update((d) => ({ ...d, [key]: d[key].map((v, i) => (i === index ? value : v)) })),
    onListAdd: (key) => update((d) => ({ ...d, [key]: [...d[key], ""] })),
    onListDel: (key, index) => update((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== index) })),
    onAddPhotos: (files) => void upload(files, (urls) => update((d) => ({ ...d, photos: [...d.photos, ...urls] }))),
    onMeetPhoto: (file) => void (file && upload([file], ([url]) => set("meetPhoto", url))),
    onMovePhoto: (index, direction) =>
      update((d) => {
        const j = index + direction;
        if (j < 0 || j >= d.photos.length) return d;
        const photos = d.photos.slice();
        [photos[index], photos[j]] = [photos[j], photos[index]];
        const cover = d.cover === index ? j : d.cover === j ? index : d.cover;
        return { ...d, photos, cover };
      }),
    onDeletePhoto: (index) => update((d) => ({ ...d, photos: d.photos.filter((_, i) => i !== index), cover: 0 })),
    booking: {
      types: BOOKING_TYPES.map((t) => ({ ...t, selected: bookingType === t.key })),
      tiers: CANCEL_TIERS.map((t) => ({ key: t.key, label: t.label, sub: t.sub, selected: cancelTierOf(draft) === t.key, saveable: t.hours !== null })),
      promise: CANCEL_TIERS.find((t) => t.key === cancelTierOf(draft))?.sub ?? "",
      unsaved: bookingType
        ? "Booking type can't be saved from here yet, so new experiences keep the current default. Moderate cancellation isn't available yet either."
        : "Moderate cancellation isn't available yet.",
      onType: setBookingType,
      onTier: (key) => {
        const hours = CANCEL_TIERS.find((t) => t.key === key)?.hours;
        if (hours == null) return;
        update((d) => ({ ...d, refund: "full_refund_until", refundHours: String(hours) }));
      },
    },
    reviews: {
      platforms: REVIEW_PLATFORMS,
      selected: reviewPlatform,
      url: reviewUrl,
      urlPlaceholder: REVIEW_LINK_HINTS[reviewPlatform] ?? "",
      canImport: Boolean(reviewPlatform && reviewUrl.trim()),
      onSelect: (platform) => setReviewPlatform((now) => (now === platform ? "" : platform)),
      onUrl: setReviewUrl,
      // Nothing can be fetched yet, so say so rather than pretend.
      onImport: () => toast.info("Importing reviews isn't available yet, so nothing was imported."),
    },
    // Until the host answers, a private price already on the listing counts as yes.
    privateGroup: {
      on: privateChoice ?? Boolean(draft.priv),
      onChange: (on) => {
        setPrivateChoice(on);
        if (!on) set("priv", "");
      },
    },
    place: {
      query,
      open: placeOpen && typing && searched,
      results: results.map((r) => ({ ...r, picked: draft.locations.some((l) => samePlace(l, r)) })),
      noMatch: searched && results.length === 0,
      selected: draft.locations.map((l, i) => ({
        key: `${l.name}:${l.lat}:${l.lng}:${i}`,
        name: l.name,
        pinned: isPinned(l),
        onRemove: () => update((d) => ({ ...d, locations: d.locations.filter((_, j) => j !== i) })),
      })),
      suggestions: POPULAR_LOCATIONS.filter((p) => !draft.locations.some((l) => samePlace(l, p))).map((p) => ({
        key: p.name,
        name: p.name,
        onPick: () => togglePlace(p),
      })),
      needsPin: draft.locations.length > 0 && !draft.locations.some(isPinned),
      onQuery: (value) => {
        setQuery(value);
        setPlaceOpen(true);
      },
      onOpen: () => setPlaceOpen(true),
      onClose: () => setPlaceOpen(false),
      onToggle: togglePlace,
      onUseTyped: () => {
        const name = query.trim().slice(0, 120);
        if (name) update((d) => ({ ...d, locations: [...d.locations, { name, lat: null, lng: null }] }));
        setQuery("");
        setPlaceOpen(false);
      },
    },
    derived: {
      titleCount: draft.title.length,
      descWords: wordCount(draft.desc),
      hookCount: wordCountLine(wordCount(draft.hook), HOOK_MAX_WORDS),
      descCount: wordCountLine(wordCount(draft.desc), DESC_MAX_WORDS),
      descError: descShortBy(wordCount(draft.desc)),
      upcoming: today ? upcomingDates(draft, new Date(`${today}T00:00:00`)) : [],
      slotSummary: slotSummary(draft),
      times: { choices: timeChoices, format: formatTime, range: (start) => timeRange(start, draft.dur) },
      price: priceBreakdown(draft),
      commissionPercent: COMMISSION_PERCENT,
      photoLabel: photoLabel(draft.photos.length),
      photoHint: photoHint(draft.photos.length),
      checklist: checklistFor(draft, subsAvailable),
      needsAge: needsAge(draft.agePolicy),
    },
  };
}
