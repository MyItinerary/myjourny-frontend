import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useListingDraft } from "../model/draft-store";
import {
  BOOK_TYPES,
  bookLabel,
  CATEGORIES,
  checklistFor,
  COMMISSION_PERCENT,
  DIETS,
  doneCountOf,
  EVERY_OPTIONS,
  metaLine,
  photoHint,
  photoLabel,
  priceBreakdown,
  searchPlaces,
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
  BuilderStep,
  BuilderStepNumber,
  ChecklistItem,
  ListingDraft,
  ListKey,
  PlaceResult,
  PriceBreakdown,
  ToggleKey,
} from "../model/listing-draft.types";
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
    onPick: (name: string) => void;
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

const toastNotConnected = () => toast.info("This will be sent for review once your listings are connected.");
const LISTINGS = `${HOST_PORTAL_BASE}/listings`;

export function useHostListingBuilderViewModel(): HostListingBuilderViewModel {
  const router = useRouter();
  const { draft, update } = useListingDraft();
  const today = useToday();
  const [step, setStep] = useState<BuilderStepNumber>(1);
  const [helperOpen, setHelperOpen] = useState(false);
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const [placeOpen, setPlaceOpen] = useState(false);

  const done = sectionsDone(draft);
  const doneCount = doneCountOf(draft);
  const canPublish = doneCount === 8;

  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) =>
    update((d) => ({ ...d, [key]: value }));
  const go = (n: number) => setStep(Math.min(9, Math.max(1, n)) as BuilderStepNumber);

  const query = typedQuery ?? draft.landmark;
  const typing = placeOpen && query.trim().length > 0 && query !== draft.landmark;
  const results = typing ? searchPlaces(query) : [];

  const addPhotos = (files: File[]) => {
    const urls = files.filter((f) => f.type.startsWith("image/")).map((f) => URL.createObjectURL(f));
    if (urls.length) update((d) => ({ ...d, photos: [...d.photos, ...urls] }));
  };

  const included = draft.inc.filter((line) => line.trim());

  return {
    header: {
      title: draft.title.trim() || "Your new listing",
      chip: "Draft",
      subtitle: "Everything you type is kept on this computer.",
      actions: [
        { label: "Review and publish", onClick: () => go(9), primary: true },
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
    onPublish: () => {
      if (!canPublish) return;
      toastNotConnected();
    },
    canPublish,
    draft,
    options: {
      categories: CATEGORIES,
      subcategories: SUBCATEGORIES[draft.cat] ?? [],
      tags: TAGS,
      diets: DIETS,
      weekDays: WEEK_DAYS,
      whenTypes: WHEN_TYPES,
      everyOptions: EVERY_OPTIONS,
      bookTypes: BOOK_TYPES,
    },
    onField: set,
    onToggle: (key, value) =>
      update((d) => ({ ...d, [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value] })),
    onPickCategory: (category) => update((d) => (d.cat === category ? d : { ...d, cat: category, sub: "" })),
    onListSet: (key, index, value) => update((d) => ({ ...d, [key]: d[key].map((v, i) => (i === index ? value : v)) })),
    onListAdd: (key) => update((d) => ({ ...d, [key]: [...d[key], ""] })),
    onListDel: (key, index) => update((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== index) })),
    onAddPhotos: addPhotos,
    onMeetPhoto: (file) => file && set("meetPhoto", URL.createObjectURL(file)),
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
      open: typing,
      results,
      noMatch: typing && results.length === 0,
      onQuery: (value) => {
        setTypedQuery(value);
        setPlaceOpen(true);
      },
      onOpen: () => setPlaceOpen(true),
      onPick: (name) => {
        setTypedQuery(null);
        setPlaceOpen(false);
        set("landmark", name);
      },
      onUseTyped: () => {
        setPlaceOpen(false);
        set("landmark", query.trim());
        setTypedQuery(null);
      },
      onClear: () => {
        setTypedQuery("");
        setPlaceOpen(true);
        set("landmark", "");
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
