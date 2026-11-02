import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useListingDraft } from "../model/draft-store";
import { useHostListingBuilderViewModel } from "./use-host-listing-builder-view-model";

const nav = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: nav.push }) }));
const toast = vi.hoisted(() => ({ info: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  window.localStorage.clear();
  const store = renderHook(() => useListingDraft());
  act(() => store.result.current.clear());
  nav.push.mockReset();
  toast.info.mockReset();
  toast.success.mockReset();
  URL.createObjectURL = vi.fn((f: Blob) => `blob:${(f as File).name}`);
});

const render = () => renderHook(() => useHostListingBuilderViewModel());

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
  const file = (name: string, type = "image/jpeg") => new File(["x"], name, { type });

  it("adds only images, reorders them, moves the cover with the photo and deletes", () => {
    const { result } = render();
    act(() => result.current.onAddPhotos([file("a.jpg"), file("b.jpg"), file("notes.pdf", "application/pdf")]));
    expect(result.current.draft.photos).toEqual(["blob:a.jpg", "blob:b.jpg"]);
    expect(result.current.derived.photoLabel).toBe("2 photos");

    act(() => result.current.onMovePhoto(0, 1));
    expect(result.current.draft.photos).toEqual(["blob:b.jpg", "blob:a.jpg"]);
    expect(result.current.draft.cover).toBe(1);
    act(() => result.current.onMovePhoto(0, -1));
    expect(result.current.draft.photos[0]).toBe("blob:b.jpg");

    act(() => result.current.onDeletePhoto(0));
    expect(result.current.draft.photos).toEqual(["blob:a.jpg"]);
  });

  it("keeps the meeting point photo", () => {
    const { result } = render();
    act(() => result.current.onMeetPhoto(undefined));
    expect(result.current.draft.meetPhoto).toBe("");
    act(() => result.current.onMeetPhoto(file("gate.jpg")));
    expect(result.current.draft.meetPhoto).toBe("blob:gate.jpg");
  });
});

describe("the landmark search", () => {
  it("suggests matches while typing and saves the one picked", () => {
    const { result } = render();
    act(() => result.current.place.onQuery("freedom"));
    expect(result.current.place.open).toBe(true);
    expect(result.current.place.results.map((r) => r.name)).toEqual(["Freedom Park"]);
    act(() => result.current.place.onPick("Freedom Park"));
    expect(result.current.draft.landmark).toBe("Freedom Park");
    expect(result.current.place.open).toBe(false);
  });

  it("lets the host use their own words when nothing matches, and change it later", () => {
    const { result } = render();
    act(() => result.current.place.onQuery("the old fig tree"));
    expect(result.current.place.noMatch).toBe(true);
    act(() => result.current.place.onUseTyped());
    expect(result.current.draft.landmark).toBe("the old fig tree");
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

describe("review and publish", () => {
  it("shows the helper and preview", () => {
    const { result } = render();
    act(() => result.current.helper.onToggle());
    expect(result.current.helper.open).toBe(true);
    expect(result.current.derived.preview.bookLabel).toBe("How they book, not set");
    expect(result.current.derived.preview.price).toBe("Price not set");
  });

  it("will not publish until all eight sections are done, then says it is not connected yet", () => {
    const { result } = render();
    act(() => result.current.onPublish());
    expect(toast.info).not.toHaveBeenCalled();

    act(() => {
      const r = result.current;
      r.onField("title", "T"); r.onField("hook", "H"); r.onField("desc", "d".repeat(90));
      r.onPickCategory("Art & creativity");
      ["a", "b", "c"].forEach((t) => r.onToggle("tags", t));
      r.onField("cue", "gate"); r.onField("meetPhoto", "blob:m");
      r.onField("whenType", "request");
      r.onField("price", "9000"); r.onField("maxG", "8");
      r.onListSet("inc", 0, "Photos"); r.onListSet("exc", 0, "Lunch");
      r.onField("fitness", "Easy"); r.onField("ageMin", "12");
      r.onField("photos", ["1", "2", "3", "4"]);
    });
    expect(result.current.canPublish).toBe(true);
    act(() => result.current.onPublish());
    expect(toast.info).toHaveBeenCalled();
  });
});
