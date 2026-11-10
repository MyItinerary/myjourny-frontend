import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";

import { useListingDraft } from "../model/draft-store";
import { useHostAccess } from "../model/host-access";
import { fetchListingForEdit, uploadPhoto, useInterestTree, usePlaceSearch, useSaveListing } from "../model/listing-builder-api";
import {
  ACCESS_OPTIONS,
  AGE_POLICIES,
  BOOK_TYPES,
  bookLabel,
  CATEGORIES,
  checklistFor,
  COMMISSION_PERCENT,
  DIETS,
  doneCountOf,
  EVERY_OPTIONS,
  FITNESS_LEVELS,
  metaLine,
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
  upcomingDates,
  WEEK_DAYS,
  WHEN_TYPES,
  wordCount,
} from "../model/listing-draft";
import type {
  Accessibility,
  AgePolicy,
  BuilderStep,
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
import { draftFromExperience, toExperiencePayload } from "../model/listing-payload";
import { HOST_PORTAL_BASE } from "../model/nav";
import type { HostPageHeader } from "./use-host-home-view-model";
import { useToday } from "./use-today";

export type BuilderOptions = {
  categories: readonly string[];
  subcategories: string[];
  tags: string[];
  diets: string[];
  weekDays: string[];
  whenTypes: typeof WHEN_TYPES;
  everyOptions: typeof EVERY_OPTIONS;
  bookTypes: typeof BOOK_TYPES;
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
  onStep: (step: number) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
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
  onToggle: (key: ToggleKey, value: string) => void;
  onPickCategory: (category: string) => void;
  onListSet: (key: ListKey, index: number, value: string) => void;
  onListAdd: (key: ListKey) => void;
  onListDel: (key: ListKey, index: number) => void;
  onAddPhotos: (files: File[]) => void;
  onMeetPhoto: (file: File | undefined) => void;
  onMovePhoto: (index: number, direction: -1 | 1) => void;
  onDeletePhoto: (index: number) => void;
  helper: { open: boolean; onToggle: () => void };
  place: {
    query: string;
    open: boolean;
    results: PlaceResult[];
    noMatch: boolean;
    onQuery: (query: string) => void;
    onOpen: () => void;
    onPick: (place: PlaceResult) => void;
    /** The landmark has a map pin. */
    pinned: boolean;
    onUseTyped: () => void;
    onClear: () => void;
  };
  derived: {
    titleCount: number;
    descWords: number;
    upcoming: string[];
    slotSummary: string;
    price: PriceBreakdown;
    commissionPercent: number;
    photoLabel: string;
    photoHint: string;
    checklist: ChecklistItem[];
    /** The age box shows for these policies. */
    needsAge: boolean;
    preview: {
      eyebrow: string;
      meta: string;
      area: string;
      description: string;
      included: string[];
      price: string;
      bookLabel: string;
    };
  };
};

const LISTINGS = `${HOST_PORTAL_BASE}/listings`;
const NOT_APPROVED = "You can publish once your guide application is approved.";

/** What itin said was wrong, in a sentence. A publish missing details answers
 * with { message, missing } rather than a string. */
function publishError(error: unknown): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (detail && typeof detail === "object" && !Array.isArray(detail) && "message" in detail) return String(detail.message);
  return apiErrorMessage(error, "Couldn't publish the listing. Please try again.");
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
  const editId = useSearchParams().get("id");
  const { draft, update, clear } = useListingDraft();
  const today = useToday();
  const access = useHostAccess();
  const { tree, ready: treeReady } = useInterestTree();
  const save = useSaveListing();
  const [step, setStep] = useState<BuilderStepNumber>(1);
  const [helperOpen, setHelperOpen] = useState(false);
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [uploading, setUploading] = useState(0);

  // Editing: load the listing into the draft once, unless this draft already is it.
  const loadForEdit = Boolean(editId) && draft.editingId !== editId;
  const listing = useQuery({
    queryKey: ["guide", "experiences", editId, "edit"],
    queryFn: () => fetchListingForEdit(editId!),
    // Categories first, so the listing's category can be named in the picker.
    enabled: loadForEdit && treeReady,
  });
  useEffect(() => {
    if (loadForEdit && listing.data) update(() => draftFromExperience(listing.data.experience, tree, listing.data.price));
  }, [loadForEdit, listing.data, tree, update]);
  // A new listing never starts from an edit that wasn't finished.
  useEffect(() => {
    if (!editId && draft.editingId) clear();
  }, [editId, draft.editingId, clear]);

  const done = sectionsDone(draft);
  const doneCount = doneCountOf(draft);
  const publishBlock = access === "approved" ? null : NOT_APPROVED;
  const canPublish = doneCount === 8 && !publishBlock && !save.isPending && uploading === 0;

  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) =>
    update((d) => ({ ...d, [key]: value }));
  const go = (n: number) => setStep(Math.min(9, Math.max(1, n)) as BuilderStepNumber);

  const query = typedQuery ?? draft.landmark;
  const typing = placeOpen && query.trim().length > 0 && query !== draft.landmark;
  const searchFor = useDebounced(typing ? query : "", 400);
  const search = usePlaceSearch(searchFor, draft.city);
  const results = typing && searchFor === query ? (search.data ?? []) : [];
  const searched = typing && searchFor === query && (search.isSuccess || search.isError || query.trim().length < 3);

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
    if (!canPublish || !today) return;
    const editing = Boolean(draft.editingId);
    save.mutate(
      { id: draft.editingId, payload: toExperiencePayload(draft, tree, today), price: Number(draft.price) },
      {
        onSuccess: () => {
          clear();
          toast.success(editing ? "Your changes are live" : "Your listing is live");
          router.push(LISTINGS);
        },
        onError: (error) => toast.error(publishError(error)),
      },
    );
  };

  const included = draft.inc.filter((line) => line.trim());
  const categories = tree.length ? tree.map((c) => c.text) : CATEGORIES;
  const subcategories = tree.length
    ? (tree.find((c) => c.text === draft.cat)?.children ?? []).map((c) => c.text)
    : (SUBCATEGORIES[draft.cat] ?? []);
  const editing = Boolean(draft.editingId);

  return {
    header: {
      title: draft.title.trim() || (editing || editId ? "Your listing" : "Your new listing"),
      chip: editing ? "Editing" : "Draft",
      subtitle: editing ? "Your changes go live when you publish them." : "Everything you type is kept on this computer.",
      actions: [
        { label: editing ? "Review and save" : "Review and publish", onClick: () => go(9), primary: true },
      ],
    },
    steps: STEP_LABELS.map((label, i) => {
      const n = (i + 1) as BuilderStepNumber;
      return { n, label, done: n < 9 ? done[n] : canPublish, active: n === step };
    }),
    step,
    doneCount,
    onStep: go,
    onBack: () => go(step - 1),
    onNext: () => go(step + 1),
    nextLabel: step === 8 ? "Review and publish" : "Continue",
    onSaveLater: () => {
      toast.success("Saved. Pick it up again from Listings.");
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
      subcategories,
      tags: TAGS,
      diets: DIETS,
      weekDays: WEEK_DAYS,
      whenTypes: WHEN_TYPES,
      everyOptions: EVERY_OPTIONS,
      bookTypes: BOOK_TYPES,
      fitnessLevels: FITNESS_LEVELS,
      agePolicies: AGE_POLICIES,
      accessOptions: ACCESS_OPTIONS,
      refundPolicies: REFUND_POLICIES,
    },
    onField: set,
    onToggle: (key, value) =>
      update((d) => ({ ...d, [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value] })),
    onPickCategory: (category) => update((d) => (d.cat === category ? d : { ...d, cat: category, sub: "" })),
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
    helper: { open: helperOpen, onToggle: () => setHelperOpen((open) => !open) },
    place: {
      query,
      open: typing && searched,
      results,
      noMatch: searched && results.length === 0,
      pinned: draft.lat !== null && draft.lng !== null,
      onQuery: (value) => {
        setTypedQuery(value);
        setPlaceOpen(true);
      },
      onOpen: () => setPlaceOpen(true),
      onPick: (place) => {
        setTypedQuery(null);
        setPlaceOpen(false);
        update((d) => ({ ...d, landmark: place.name.slice(0, 120), lat: place.lat, lng: place.lng }));
      },
      // Kept as the landmark's name, but with no pin until one is picked from the list.
      onUseTyped: () => {
        setPlaceOpen(false);
        update((d) => ({ ...d, landmark: query.trim().slice(0, 120), lat: null, lng: null }));
        setTypedQuery(null);
      },
      onClear: () => {
        setTypedQuery("");
        setPlaceOpen(true);
        update((d) => ({ ...d, landmark: "", lat: null, lng: null }));
      },
    },
    derived: {
      titleCount: draft.title.length,
      descWords: wordCount(draft.desc),
      upcoming: today ? upcomingDates(draft, new Date(`${today}T00:00:00`)) : [],
      slotSummary: slotSummary(draft),
      price: priceBreakdown(draft),
      commissionPercent: COMMISSION_PERCENT,
      photoLabel: photoLabel(draft.photos.length),
      photoHint: photoHint(draft.photos.length),
      checklist: checklistFor(draft),
      needsAge: needsAge(draft.agePolicy),
      preview: {
        eyebrow: (draft.cat || "Category").toUpperCase(),
        meta: metaLine(draft),
        area: `${draft.area ? `${draft.area}, ${draft.city} · ` : ""}Exact spot sent when you book`,
        description:
          draft.desc.length > 300 ? `${draft.desc.slice(0, 300).trim()}…` : draft.desc || "Your description will show here as you write it.",
        included,
        price: draft.price ? `₦${Number(draft.price).toLocaleString("en-US")}` : "Price not set",
        bookLabel: bookLabel(draft.bookType),
      },
    },
  };
}
