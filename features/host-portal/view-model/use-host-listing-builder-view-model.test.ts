import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { http, HttpResponse } from "msw";

import { apiUrl } from "@/test/msw/handlers";
import { builderHandlers, CLOUDINARY, FREEDOM_PARK } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import type { HostAccess } from "../model/host-access";
import { useListingDraft, useSampleDraft } from "../model/draft-store";
import { useHostListingBuilderViewModel } from "./use-host-listing-builder-view-model";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), id: null as string | null, template: null as string | null }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  useSearchParams: () =>
    new URLSearchParams({ ...(nav.id ? { id: nav.id } : {}), ...(nav.template ? { template: nav.template } : {}) }),
}));
const toast = vi.hoisted(() => Object.assign(vi.fn(), { info: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));
const access = vi.hoisted(() => ({ current: "approved" as HostAccess }));
vi.mock("../model/host-access", () => ({ useHostAccess: () => access.current }));

beforeEach(() => {
  window.localStorage.clear();
  const store = renderHook(() => useListingDraft());
  act(() => store.result.current.clear());
  nav.push.mockReset();
  nav.replace.mockReset();
  nav.id = null;
  nav.template = null;
  access.current = "approved";
  [toast, toast.info, toast.success, toast.error].forEach((fn) => fn.mockReset());
  server.use(...builderHandlers());
});

const render = () => renderHookWithProviders(() => useHostListingBuilderViewModel());

/** n distinct words. */
const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
const LONG = words(500);
/** Step 1 written, so the host can move on from it. */
function writeBasics(r: ReturnType<typeof useHostListingBuilderViewModel>) {
  r.onField("title", "Lagoon kayak");
  r.onField("hook", "Paddle at sunrise.");
  r.onField("desc", LONG);
}
/** Steps 1 and 2 filled in, so the host can go anywhere. */
function writeRequired(r: ReturnType<typeof useHostListingBuilderViewModel>) {
  writeBasics(r);
  r.onField("cats", ["Art & creativity"]);
  r.onField("subs", ["Photography walk"]);
  r.onField("tags", ["Walking"]);
}

describe("the step navigator", () => {
  it("flags a section left unfinished, and keeps review locked", () => {
    const { result } = render();
    expect(result.current.steps[0].attention).toBeNull();
    expect(result.current.steps[10]).toMatchObject({ locked: true, sub: "Finish the required steps" });
    expect(result.current.steps[8]).toMatchObject({ label: "Reviews", locked: false, attention: null });
    act(() => writeRequired(result.current));
    act(() => result.current.onNext());
    expect(result.current.stepBar).toMatchObject({ eyebrow: "Step 2 of 11", title: "Category and tags", canPrev: true, canNext: true });
    act(() => result.current.onNext());
    act(() => result.current.onNext());
    expect(result.current.steps[0].attention).toBeNull();
    expect(result.current.steps[2].attention).toBe("A location on the map, a meeting point and a photo");
    expect(result.current.steps[4].attention).toBeNull();
  });

  it("moves with Alt+Up and Alt+Down, and closes the sheet on a jump", () => {
    const { result } = render();
    act(() => writeRequired(result.current));
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", altKey: true })));
    expect(result.current.step).toBe(2);
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", altKey: true })));
    expect(result.current.step).toBe(1);
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" })));
    expect(result.current.step).toBe(1);
    act(() => result.current.sheet.onToggle());
    expect(result.current.sheet.open).toBe(true);
    act(() => result.current.onStep(4));
    expect(result.current.sheet.open).toBe(false);
  });
});

describe("how guests book", () => {
  it("sets the refund hours from Flexible or Strict and leaves Moderate alone", () => {
    const { result } = render();
    expect(result.current.booking.tiers.every((t) => !t.selected)).toBe(true);
    act(() => result.current.booking.onTier("Flexible"));
    expect(result.current.draft).toMatchObject({ refund: "full_refund_until", refundHours: "24" });
    expect(result.current.booking.tiers.find((t) => t.key === "Flexible")?.selected).toBe(true);
    expect(result.current.booking.promise).toMatch(/24 hours/);
    act(() => result.current.booking.onTier("Strict"));
    expect(result.current.draft.refundHours).toBe("168");
    act(() => result.current.booking.onTier("Moderate"));
    expect(result.current.draft.refundHours).toBe("168");
    expect(result.current.booking.tiers.find((t) => t.key === "Moderate")?.saveable).toBe(false);
  });

  it("remembers the booking type for the session and says it is not saved", () => {
    const { result } = render();
    act(() => result.current.booking.onType("instant"));
    expect(result.current.booking.types.find((t) => t.key === "instant")?.selected).toBe(true);
    expect(result.current.booking.unsaved).toMatch(/can't be saved/);
  });
});

describe("bringing in reviews", () => {
  it("picks a place, asks for its link and says importing is not available", () => {
    const { result } = render();
    expect(result.current.reviews.canImport).toBe(false);
    act(() => result.current.reviews.onSelect("Google"));
    expect(result.current.reviews.urlPlaceholder).toBe("Paste your Google Maps or business link");
    act(() => result.current.reviews.onUrl("https://maps.app.goo.gl/x"));
    expect(result.current.reviews.canImport).toBe(true);
    act(() => result.current.reviews.onImport());
    expect(toast.info).toHaveBeenCalled();
    act(() => result.current.reviews.onSelect("Google"));
    expect(result.current.reviews.selected).toBe("");
  });
});

describe("the private group option", () => {
  it("starts off, shows the price once on, and clears it when turned off", () => {
    const { result } = render();
    expect(result.current.privateGroup.on).toBe(false);
    act(() => result.current.privateGroup.onChange(true));
    act(() => result.current.onField("priv", "50000"));
    expect(result.current.privateGroup.on).toBe(true);
    act(() => result.current.privateGroup.onChange(false));
    expect(result.current.privateGroup.on).toBe(false);
    expect(result.current.draft.priv).toBe("");
  });

  it("counts a private price already on the draft as yes", () => {
    const { result } = render();
    act(() => result.current.onField("priv", "65000"));
    expect(result.current.privateGroup.on).toBe(true);
  });
});

describe("moving through the sections", () => {
  it("starts on the basics with nothing done", () => {
    const { result } = render();
    expect(result.current.step).toBe(1);
    expect(result.current.doneCount).toBe(0);
    expect(result.current.steps).toHaveLength(11);
    expect(result.current.header).toMatchObject({ title: "Your new experience", chip: "Draft" });
  });

  it("goes forward, back and straight to a section, staying inside 1 to 11", () => {
    const { result } = render();
    act(() => writeRequired(result.current));
    act(() => result.current.onNext());
    expect(result.current.step).toBe(2);
    act(() => result.current.onBack());
    act(() => result.current.onBack());
    expect(result.current.step).toBe(1);
    act(() => result.current.onStep(10));
    expect(result.current.nextLabel).toBe("Review and publish");
    act(() => result.current.onStep(40));
    expect(result.current.step).toBe(11);
  });

  it("won't move past step 1 until the title and both descriptions are written", () => {
    const { result } = render();
    expect(result.current.canContinue).toBe(false);
    expect(result.current.stepBar.canNext).toBe(false);
    expect(result.current.steps[1].blocked).toBe(true);
    act(() => result.current.onNext());
    act(() => result.current.onStep(5));
    expect(result.current.step).toBe(1);

    act(() => {
      result.current.onField("title", "Lagoon kayak");
      result.current.onField("hook", "Paddle at sunrise.");
      result.current.onField("desc", words(99));
    });
    expect(result.current.canContinue).toBe(false);
    expect(result.current.derived.descError).toBe("Write at least 100 words. 1 to go.");

    act(() => result.current.onField("desc", LONG));
    expect(result.current.canContinue).toBe(true);
    expect(result.current.derived.descError).toBeNull();
    act(() => result.current.onNext());
    expect(result.current.step).toBe(2);
  });

  it("won't move past the category step until a category, a subcategory and a tag are picked", () => {
    const { result } = render();
    act(() => writeBasics(result.current));
    act(() => result.current.onNext());
    expect(result.current.step).toBe(2);
    expect(result.current.canContinue).toBe(false);

    act(() => result.current.onPickCategory("Art & creativity"));
    act(() => result.current.onToggle("tags", "Walking"));
    expect(result.current.canContinue).toBe(false);
    act(() => result.current.onToggle("subs", "Photography walk"));
    expect(result.current.canContinue).toBe(true);
    expect(result.current.steps[1].done).toBe(true);
  });

  it("offers the category tip only after two minutes on that step, and again on each new visit", () => {
    vi.useFakeTimers();
    try {
      const { result } = render();
      act(() => writeBasics(result.current));
      act(() => result.current.onNext());
      expect(result.current.categoryTip).toBe(false);
      act(() => vi.advanceTimersByTime(119_000));
      expect(result.current.categoryTip).toBe(false);
      act(() => vi.advanceTimersByTime(1_000));
      expect(result.current.categoryTip).toBe(true);

      act(() => result.current.onBack());
      expect(result.current.categoryTip).toBe(false);
      act(() => result.current.onNext());
      expect(result.current.categoryTip).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the long description to 1,000 words and counts them", () => {
    const { result } = render();
    expect(result.current.derived.descCount).toBe("0 of 1,000 words");
    expect(result.current.derived.descError).toBeNull();
    act(() => result.current.onField("desc", words(1200)));
    expect(result.current.derived.descWords).toBe(1000);
    expect(result.current.derived.descCount).toBe("1,000 of 1,000 words");
  });

  it("keeps the short description to 100 words and counts them", () => {
    const { result } = render();
    expect(result.current.derived.hookCount).toBe("0 of 100 words");
    act(() => result.current.onField("hook", words(130)));
    expect(result.current.derived.hookCount).toBe("100 of 100 words");
    expect(result.current.draft.hook.split(" ")).toHaveLength(100);
  });

  it("shows the tip for the field last clicked into", () => {
    const { result } = render();
    expect(result.current.tip).toBeNull();
    act(() => result.current.onFocusField("hook"));
    expect(result.current.tip).toBe("hook");
    act(() => result.current.onFocusField("desc"));
    expect(result.current.tip).toBe("desc");
  });

  it("has no review button in the header; the step nav opens the review", () => {
    const { result } = render();
    expect(result.current.header.actions).toEqual([]);
  });

  it("saves and leaves for Experiences", () => {
    const { result } = render();
    act(() => result.current.onSaveLater());
    expect(toast.success).toHaveBeenCalled();
    expect(nav.push).toHaveBeenCalledWith("/host/dashboard/listings");
  });
});

describe("filling it in", () => {
  it("keeps typed text in the draft and in the title of the header", () => {
    const { result } = render();
    act(() => result.current.onField("title", "Lagos Island Photowalk"));
    expect(result.current.draft.title).toBe("Lagos Island Photowalk");
    expect(result.current.header.title).toBe("Lagos Island Photowalk");
    expect(result.current.derived.titleCount).toBe(22);
  });

  it("picks more than one category, groups their subcategories, and drops a category's subcategories when it is unpicked", () => {
    const { result } = render();
    act(() => result.current.onPickCategory("Art & creativity"));
    act(() => result.current.onPickCategory("Wellness & calm"));
    expect(result.current.draft.cats).toEqual(["Art & creativity", "Wellness & calm"]);
    expect(result.current.options.subGroups.map((g) => g.category)).toEqual(["Art & creativity", "Wellness & calm"]);
    expect(result.current.options.subGroups[1].subs).toContain("Yoga");

    act(() => result.current.onToggle("subs", "Photography walk"));
    act(() => result.current.onToggle("subs", "Yoga"));
    expect(result.current.draft.subs).toEqual(["Photography walk", "Yoga"]);

    act(() => result.current.onPickCategory("Art & creativity"));
    expect(result.current.draft.cats).toEqual(["Wellness & calm"]);
    expect(result.current.draft.subs).toEqual(["Yoga"]);
  });

  it("toggles tags, days and food on and off", () => {
    const { result } = render();
    act(() => result.current.onToggle("tags", "Walking"));
    expect(result.current.draft.tags).toEqual(["Walking"]);
    act(() => result.current.onToggle("tags", "Walking"));
    expect(result.current.draft.tags).toEqual([]);
  });

  it("adds, edits and removes lines", () => {
    const { result } = render();
    act(() => result.current.onListSet("inc", 0, "Photos"));
    act(() => result.current.onListAdd("inc"));
    expect(result.current.draft.inc).toEqual(["Photos", ""]);
    act(() => result.current.onListDel("inc", 0));
    expect(result.current.draft.inc).toEqual([""]);
  });

  it("prices a seat and shows what the host keeps", () => {
    const { result } = render();
    act(() => result.current.onField("price", "9000"));
    act(() => result.current.onField("maxG", "8"));
    expect(result.current.derived.price.net).toBe("₦61,200");
    expect(result.current.derived.commissionPercent).toBe(15);
  });
});

describe("photos", () => {
  // Uploads come back numbered in the order they arrive (see builderHandlers).
  const file = (name: string, type = "image/jpeg") => new File([name], name, { type });

  it("uploads only images, in the order picked, then reorders, moves the cover and deletes", async () => {
    const { result } = render();
    act(() => result.current.onAddPhotos([file("a.jpg"), file("b.jpg"), file("notes.pdf", "application/pdf")]));
    expect(result.current.uploading).toBe(2);
    await waitFor(() => expect(result.current.draft.photos).toEqual([`${CLOUDINARY}photo-1.jpg`, `${CLOUDINARY}photo-2.jpg`]));
    expect(result.current.uploading).toBe(0);
    expect(result.current.derived.photoLabel).toBe("2 photos");

    act(() => result.current.onMovePhoto(0, 1));
    expect(result.current.draft.photos).toEqual([`${CLOUDINARY}photo-2.jpg`, `${CLOUDINARY}photo-1.jpg`]);
    expect(result.current.draft.cover).toBe(1);
    act(() => result.current.onMovePhoto(0, -1));
    expect(result.current.draft.photos[0]).toBe(`${CLOUDINARY}photo-2.jpg`);

    act(() => result.current.onDeletePhoto(0));
    expect(result.current.draft.photos).toEqual([`${CLOUDINARY}photo-1.jpg`]);
  });

  it("uploads the meeting point photo", async () => {
    const { result } = render();
    act(() => result.current.onMeetPhoto(undefined));
    expect(result.current.draft.meetPhoto).toBe("");
    act(() => result.current.onMeetPhoto(file("gate.jpg")));
    await waitFor(() => expect(result.current.draft.meetPhoto).toBe(`${CLOUDINARY}photo-1.jpg`));
  });

  it("says when a photo couldn't be uploaded, and keeps the rest", async () => {
    server.use(http.get(apiUrl("/guide/uploads/cloudinary-signature"), () => HttpResponse.json({ detail: "Uploads are not configured" }, { status: 503 })));
    const { result } = render();
    act(() => result.current.onAddPhotos([file("a.jpg")]));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Couldn't upload a.jpg. Please try again."));
    expect(result.current.draft.photos).toEqual([]);
    expect(result.current.uploading).toBe(0);
  });
});

describe("the location search", () => {
  it("shows results only after a keystroke, and picks more than one, keeping the list open", async () => {
    const { result } = render();
    act(() => result.current.place.onOpen());
    expect(result.current.place.open).toBe(false);

    act(() => result.current.place.onQuery("freedom"));
    await waitFor(() => expect(result.current.place.results.map((r) => r.name)).toEqual(["Freedom Park"]));
    expect(result.current.place.open).toBe(true);
    expect(result.current.place.results[0].picked).toBe(false);

    act(() => result.current.place.onToggle(result.current.place.results[0]));
    expect(result.current.draft.locations).toEqual([{ name: "Freedom Park", lat: FREEDOM_PARK.lat, lng: FREEDOM_PARK.lng }]);
    expect(result.current.place.results[0].picked).toBe(true);
    expect(result.current.place.open).toBe(true);

    act(() => result.current.place.onToggle(result.current.place.results[0]));
    expect(result.current.draft.locations).toEqual([]);

    act(() => result.current.place.onClose());
    expect(result.current.place.open).toBe(false);
  });

  it("offers popular places to pick without searching, and moves a picked one into the locations", () => {
    const { result } = render();
    expect(result.current.place.suggestions.map((s) => s.name)).toContain("Lekki Phase 1");
    expect(result.current.place.selected).toEqual([]);

    act(() => result.current.place.suggestions.find((s) => s.name === "Lekki Phase 1")!.onPick());
    expect(result.current.place.selected.map((l) => [l.name, l.pinned])).toEqual([["Lekki Phase 1", true]]);
    expect(result.current.place.suggestions.map((s) => s.name)).not.toContain("Lekki Phase 1");
    // The first place picked says which city and area it's in.
    expect(result.current.draft).toMatchObject({ city: "Lagos", area: "Lekki Phase 1" });

    act(() => result.current.place.suggestions.find((s) => s.name === "Abeokuta")!.onPick());
    expect(result.current.draft).toMatchObject({ city: "Lagos", area: "Lekki Phase 1" });
    expect(result.current.place.selected.map((l) => l.name)).toEqual(["Lekki Phase 1", "Abeokuta"]);

    act(() => result.current.place.selected[0].onRemove());
    expect(result.current.place.selected.map((l) => l.name)).toEqual(["Abeokuta"]);
    expect(result.current.place.suggestions.map((s) => s.name)).toContain("Lekki Phase 1");
  });

  it("takes the city and area from a search result, keeping them when the map doesn't say", () => {
    const { result } = render();
    act(() => result.current.place.onToggle({ name: "Somewhere", area: "", lat: 9, lng: 7 }));
    expect(result.current.draft).toMatchObject({ city: "Lagos", area: "" });
    act(() => result.current.place.selected[0].onRemove());
    act(() => result.current.place.onToggle({ name: "Jabi Lake", area: "Jabi, Abuja", lat: 9.07, lng: 7.42, city: "Abuja", district: "Jabi" }));
    expect(result.current.draft).toMatchObject({ city: "Abuja", area: "Jabi" });
  });

  it("adds the host's own words when nothing matches, with no pin, and says none is on the map", async () => {
    const { result } = render();
    act(() => result.current.place.onQuery("the old fig tree"));
    await waitFor(() => expect(result.current.place.noMatch).toBe(true));
    act(() => result.current.place.onUseTyped());
    expect(result.current.draft.locations).toEqual([{ name: "the old fig tree", lat: null, lng: null }]);
    expect(result.current.place.selected.map((l) => [l.name, l.pinned])).toEqual([["the old fig tree", false]]);
    expect(result.current.place.needsPin).toBe(true);
    expect(result.current.place).toMatchObject({ query: "", open: false });
  });
});

/** Every section filled in, as a guide would. */
function fillEverything(r: ReturnType<typeof useHostListingBuilderViewModel>) {
  r.onField("title", "Lagoon kayak and breakfast"); r.onField("hook", "Paddle at sunrise"); r.onField("desc", LONG);
  r.onPickCategory("Nature & outdoors");
  r.onToggle("subs", "Hike or trail walk");
  ["a", "b", "c"].forEach((t) => r.onToggle("tags", t));
  r.onField("locations", [{ name: "Freedom Park", lat: 6.45, lng: 3.39 }]);
  r.onField("cue", "The blue gate"); r.onField("meetPhoto", `${CLOUDINARY}gate.jpg`);
  r.onField("whenType", "request");
  r.onField("price", "15000"); r.onField("maxG", "8"); r.onField("refund", "non_refundable");
  r.onListSet("inc", 0, "Breakfast"); r.onListSet("exc", 0, "Transport");
  r.onField("fitness", "moderate"); r.onField("agePolicy", "all_ages"); r.onField("access", "not_suitable");
  r.onField("photos", ["1", "2", "3", "4"].map((n) => `${CLOUDINARY}${n}.jpg`));
}

describe("review and publish", () => {
  it("publishes a finished experience to itin, then clears the draft and goes to Experiences", async () => {
    let sent: Record<string, unknown> | null = null;
    server.use(
      http.post(apiUrl("/experiences/"), async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "e1", status: "ACTIVE", title: "Lagoon kayak and breakfast" }, { status: 201 });
      }),
    );
    const { result } = render();
    act(() => result.current.onPublish());
    expect(sent).toBeNull();

    act(() => fillEverything(result.current));
    expect(result.current.canPublish).toBe(true);
    act(() => result.current.onPublish());

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Your experience is live"));
    expect(sent).toMatchObject({
      title: "Lagoon kayak and breakfast",
      status: "ACTIVE",
      latitude: 6.45,
      fitness_level: "moderate",
      prices: [{ label: "Adult", amount: 15000, pricing_unit: "per_person" }],
    });
    expect(nav.push).toHaveBeenCalledWith("/host/dashboard/listings");
    expect(result.current.draft.title).toBe("");
  });

  it("passes on what itin says is missing", async () => {
    server.use(
      http.post(apiUrl("/experiences/"), () =>
        HttpResponse.json({ detail: { message: "Add the missing details before publishing", missing: ["pin"] } }, { status: 422 }),
      ),
    );
    const { result } = render();
    act(() => fillEverything(result.current));
    act(() => result.current.onPublish());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Add the missing details before publishing"));
    expect(nav.push).not.toHaveBeenCalled();
    expect(result.current.draft.title).toBe("Lagoon kayak and breakfast");
  });

  it("won't publish for a guide who isn't approved yet, and says why", () => {
    access.current = "pending";
    const { result } = render();
    act(() => fillEverything(result.current));
    expect(result.current.canPublish).toBe(false);
    expect(result.current.publishBlock).toBe("You can publish once your guide application is approved.");
  });
});

describe("editing an experience", () => {
  const KAYAK = {
    id: "e1",
    status: "INACTIVE",
    review_note: "Use a photo from the trip.",
    title: "Lagoon kayak",
    headline: "Paddle at sunrise",
    city: "Lagos",
    schedule_type: "recurring",
    recurrence_days: ["sat"],
    start_times: ["07:30:00"],
    images: [`${CLOUDINARY}k.jpg`],
    fitness_level: "moderate",
  };

  it("loads the experience into the builder, then saves it and its price", async () => {
    nav.id = "e1";
    let put: Record<string, unknown> | null = null;
    let patched: unknown = null;
    server.use(
      http.get(apiUrl("/guide/experiences/e1"), () => HttpResponse.json(KAYAK)),
      http.get(apiUrl("/experiences/e1/pricing"), () => HttpResponse.json({ prices: [{ id: "p1", amount: "12000.00" }] })),
      http.put(apiUrl("/experiences/e1"), async ({ request }) => {
        put = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...KAYAK, status: "ACTIVE" });
      }),
      http.patch(apiUrl("/experiences/e1/prices/p1"), async ({ request }) => {
        patched = await request.json();
        return HttpResponse.json({});
      }),
    );
    const { result } = render();
    expect(result.current.loadingListing).toBe(true);

    await waitFor(() => expect(result.current.draft.title).toBe("Lagoon kayak"));
    expect(result.current.loadingListing).toBe(false);
    expect(result.current.editing).toBe(true);
    expect(result.current.header).toMatchObject({ chip: "Editing" });
    expect(result.current.draft).toMatchObject({ days: ["Sat"], slots: ["07:30"], price: "12000", fitness: "moderate" });

    act(() => fillEverything(result.current));
    act(() => result.current.onPublish());

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Your changes are live"));
    expect(put).toMatchObject({ title: "Lagoon kayak and breakfast", status: "ACTIVE" });
    expect(patched).toEqual({ amount: 15000 });
  });

  it("starts a new experience fresh after an unfinished edit", async () => {
    nav.id = "e1";
    server.use(
      http.get(apiUrl("/guide/experiences/e1"), () => HttpResponse.json(KAYAK)),
      http.get(apiUrl("/experiences/e1/pricing"), () => HttpResponse.json({ prices: [] })),
    );
    const editing = render();
    await waitFor(() => expect(editing.result.current.editing).toBe(true));
    editing.unmount();

    nav.id = null;
    const { result } = render();
    await waitFor(() => expect(result.current.editing).toBe(false));
    expect(result.current.draft.title).toBe("");
  });
});

describe("starting from a template", () => {
  it("fills in a draft and drops the template from the address", () => {
    nav.template = "portrait-walk";
    const { result } = render();

    expect(result.current.draft.title).toBe("Golden hour portrait walk");
    expect(result.current.draft.price).toBe("10000");
    expect(nav.replace).toHaveBeenCalledWith("/host/dashboard/listings/new");
    expect(toast).not.toHaveBeenCalled();
  });

  it("ignores a template it doesn't know", () => {
    nav.template = "nope";
    const { result } = render();
    expect(result.current.draft.title).toBe("");
    expect(result.current.check).toBeNull();
  });

  it("asks the host to check a filled-in step before they can move past it", () => {
    nav.template = "portrait-walk";
    const { result } = render();

    expect(result.current.check).toMatchObject({ checked: false });
    expect(result.current.check!.note).toContain('"Golden hour portrait walk" template');
    expect(result.current.canContinue).toBe(false);
    expect(result.current.steps[1].blocked).toBe(true);
    act(() => result.current.onNext());
    act(() => result.current.onStep(9));
    expect(result.current.step).toBe(1);

    // The template's description is a start; it still needs the host's own 100 words.
    act(() => result.current.check!.onToggle());
    expect(result.current.canContinue).toBe(false);
    act(() => result.current.onField("desc", LONG));
    expect(result.current.canContinue).toBe(true);
    expect(result.current.steps[0].done).toBe(true);
    act(() => result.current.onNext());
    expect(result.current.step).toBe(2);
  });

  it("lets the host through the steps the template left to them, up to the next one to check", () => {
    nav.template = "portrait-walk";
    const { result } = render();
    act(() => result.current.onField("desc", LONG));
    act(() => result.current.check!.onToggle());
    act(() => result.current.onNext());
    act(() => result.current.check!.onToggle());
    act(() => result.current.onNext());

    expect(result.current.step).toBe(3);
    expect(result.current.check).toBeNull();
    expect(result.current.canContinue).toBe(true);
    act(() => result.current.onStep(9));
    expect(result.current.step).toBe(4);
  });

  it("can untick a step it ticked", () => {
    nav.template = "portrait-walk";
    const { result } = render();
    act(() => result.current.check!.onToggle());
    act(() => result.current.check!.onToggle());
    expect(result.current.canContinue).toBe(false);
  });

  it("offers to bring back a draft the template replaced", () => {
    const store = renderHook(() => useListingDraft());
    act(() => store.result.current.update((d) => ({ ...d, title: "My own walk" })));
    nav.template = "boat-morning";
    const { result } = render();

    expect(result.current.draft.title).toBe("Boat morning");
    expect(toast).toHaveBeenCalledWith(expect.stringContaining("replaced the draft you had"), expect.anything());
    const { action } = toast.mock.calls[0][1] as { action: { onClick: () => void } };
    act(() => action.onClick());
    expect(result.current.draft.title).toBe("My own walk");
  });
});

describe("the Filled preview", () => {
  beforeEach(() => {
    window.localStorage.setItem("myjourny:host-preview", "full");
    const sampleStore = renderHook(() => useSampleDraft());
    act(() => sampleStore.result.current.clear());
  });

  it("shows the sample experience, every section done, with both descriptions filled", () => {
    const { result } = render();
    expect(result.current.draft.title).toBe("Lagos Island photowalk at golden hour");
    expect(result.current.derived.descWords).toBeGreaterThanOrEqual(100);
    expect(result.current.doneCount).toBe(8);
    expect(result.current.canContinue).toBe(true);
  });

  it("keeps edits to the sample in memory, away from the host's own draft", () => {
    const { result } = render();
    act(() => result.current.onField("title", "Changed in the preview"));
    expect(result.current.draft.title).toBe("Changed in the preview");
    expect(window.localStorage.getItem("myjourny:host-listing-draft")).toBeNull();
  });

  it("publishes nothing from the sample", () => {
    const { result } = render();
    act(() => result.current.onStep(11));
    act(() => result.current.onPublish());
    expect(toast.info).toHaveBeenCalledWith("This is the sample experience, so nothing was published.");
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("shows the host's own draft again once switched back to Empty", () => {
    const { result } = render();
    act(() => {
      window.localStorage.removeItem("myjourny:host-preview");
      window.dispatchEvent(new StorageEvent("storage"));
    });
    expect(result.current.draft.title).toBe("");
  });
});
