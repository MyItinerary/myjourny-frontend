import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { http, HttpResponse } from "msw";

import { apiUrl } from "@/test/msw/handlers";
import { builderHandlers, CLOUDINARY, FREEDOM_PARK } from "@/test/msw/host-builder";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import type { HostAccess } from "../model/host-access";
import { useListingDraft } from "../model/draft-store";
import { useHostListingBuilderViewModel } from "./use-host-listing-builder-view-model";

const nav = vi.hoisted(() => ({ push: vi.fn(), id: null as string | null }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => new URLSearchParams(nav.id ? `id=${nav.id}` : ""),
}));
const toast = vi.hoisted(() => ({ info: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));
const access = vi.hoisted(() => ({ current: "approved" as HostAccess }));
vi.mock("../model/host-access", () => ({ useHostAccess: () => access.current }));

beforeEach(() => {
  window.localStorage.clear();
  const store = renderHook(() => useListingDraft());
  act(() => store.result.current.clear());
  nav.push.mockReset();
  nav.id = null;
  access.current = "approved";
  Object.values(toast).forEach((fn) => fn.mockReset());
  server.use(...builderHandlers());
});

const render = () => renderHookWithProviders(() => useHostListingBuilderViewModel());

describe("moving through the sections", () => {
  it("starts on the basics with nothing done", () => {
    const { result } = render();
    expect(result.current.step).toBe(1);
    expect(result.current.doneCount).toBe(0);
    expect(result.current.steps).toHaveLength(9);
    expect(result.current.header).toMatchObject({ title: "Your new listing", chip: "Draft" });
  });

  it("goes forward, back and straight to a section, staying inside 1 to 9", () => {
    const { result } = render();
    act(() => result.current.onNext());
    expect(result.current.step).toBe(2);
    act(() => result.current.onBack());
    act(() => result.current.onBack());
    expect(result.current.step).toBe(1);
    act(() => result.current.onStep(8));
    expect(result.current.nextLabel).toBe("Review and publish");
    act(() => result.current.onStep(40));
    expect(result.current.step).toBe(9);
  });

  it("saves and leaves for Listings", () => {
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

  it("clears the subcategory when the category changes but not when it is re-picked", () => {
    const { result } = render();
    act(() => result.current.onPickCategory("Art & creativity"));
    act(() => result.current.onField("sub", "Photography walk"));
    act(() => result.current.onPickCategory("Art & creativity"));
    expect(result.current.draft.sub).toBe("Photography walk");
    act(() => result.current.onPickCategory("Wellness & calm"));
    expect(result.current.draft.sub).toBe("");
    expect(result.current.options.subcategories).toContain("Yoga");
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

describe("the landmark search", () => {
  it("suggests places on the map while typing and pins the one picked", async () => {
    const { result } = render();
    act(() => result.current.place.onQuery("freedom"));
    await waitFor(() => expect(result.current.place.results.map((r) => r.name)).toEqual(["Freedom Park"]));
    expect(result.current.place.open).toBe(true);
    act(() => result.current.place.onPick(result.current.place.results[0]));
    expect(result.current.draft).toMatchObject({ landmark: "Freedom Park", lat: FREEDOM_PARK.lat, lng: FREEDOM_PARK.lng });
    expect(result.current.place).toMatchObject({ open: false, pinned: true });
  });

  it("lets the host use their own words when nothing matches, with no pin, and change it later", async () => {
    const { result } = render();
    act(() => result.current.place.onQuery("the old fig tree"));
    await waitFor(() => expect(result.current.place.noMatch).toBe(true));
    act(() => result.current.place.onUseTyped());
    expect(result.current.draft).toMatchObject({ landmark: "the old fig tree", lat: null, lng: null });
    expect(result.current.place.pinned).toBe(false);
    act(() => result.current.place.onClear());
    expect(result.current.draft.landmark).toBe("");
    expect(result.current.place.query).toBe("");
  });

  it("opens only after a keystroke, not on focus alone", () => {
    const { result } = render();
    act(() => result.current.place.onOpen());
    expect(result.current.place.open).toBe(false);
  });
});

/** Every section filled in, as a guide would. */
function fillEverything(r: ReturnType<typeof useHostListingBuilderViewModel>) {
  r.onField("title", "Lagoon kayak and breakfast"); r.onField("hook", "Paddle at sunrise"); r.onField("desc", "d".repeat(90));
  r.onPickCategory("Nature & outdoors");
  ["a", "b", "c"].forEach((t) => r.onToggle("tags", t));
  r.onField("landmark", "Freedom Park"); r.onField("lat", 6.45); r.onField("lng", 3.39);
  r.onField("cue", "The blue gate"); r.onField("meetPhoto", `${CLOUDINARY}gate.jpg`);
  r.onField("whenType", "request");
  r.onField("price", "15000"); r.onField("maxG", "8"); r.onField("refund", "non_refundable");
  r.onListSet("inc", 0, "Breakfast"); r.onListSet("exc", 0, "Transport");
  r.onField("fitness", "moderate"); r.onField("agePolicy", "all_ages"); r.onField("access", "not_suitable");
  r.onField("photos", ["1", "2", "3", "4"].map((n) => `${CLOUDINARY}${n}.jpg`));
}

describe("review and publish", () => {
  it("shows the helper and preview", () => {
    const { result } = render();
    act(() => result.current.helper.onToggle());
    expect(result.current.helper.open).toBe(true);
    expect(result.current.derived.preview.bookLabel).toBe("How they book, not set");
    expect(result.current.derived.preview.price).toBe("Price not set");
  });

  it("publishes a finished listing to itin, then clears the draft and goes to Listings", async () => {
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

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Your listing is live"));
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

describe("editing a listing", () => {
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

  it("loads the listing into the builder, then saves it and its price", async () => {
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

  it("starts a new listing fresh after an unfinished edit", async () => {
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
