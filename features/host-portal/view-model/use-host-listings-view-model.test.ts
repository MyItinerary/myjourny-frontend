import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_LISTINGS } from "../model/sample-listings";
import { useHostListingsViewModel } from "./use-host-listings-view-model";

const nav = vi.hoisted(() => ({ push: vi.fn(), preview: "full" as string | null }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => new URLSearchParams(nav.preview ? `preview=${nav.preview}` : ""),
}));
const toast = vi.hoisted(() => ({ info: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));
vi.mock("../model/listings-data", () => ({ useHostListings: (preview: string | null) => (preview === "full" ? SAMPLE_LISTINGS : []) }));

beforeEach(() => {
  nav.preview = "full";
  nav.push.mockReset();
  Object.values(toast).forEach((fn) => fn.mockReset());
});

const render = () => renderHook(() => useHostListingsViewModel()).result;
const titles = (result: { current: ReturnType<typeof useHostListingsViewModel> }) => result.current.rows.map((r) => r.listing.title);

describe("page header and empty host", () => {
  it("summarises the listings and offers a new one", () => {
    const { current } = render();
    expect(current.header.title).toBe("Your listings");
    expect(current.header.subtitle).toBe("8 listings · 1 live · 1 in review");
    expect(current.header.actions[0]).toMatchObject({ label: "Start a new listing", href: "/host/dashboard/listings/new" });
    expect(current.isEmpty).toBe(false);
  });

  it("is empty with no listings", () => {
    nav.preview = null;
    const { current } = render();
    expect(current.isEmpty).toBe(true);
    expect(current.header.subtitle).toBe("Nothing here yet");
    expect(current.rows).toEqual([]);
    expect(current.noMatches).toBe(false);
  });
});

describe("search and filters", () => {
  it("searches by title and reports the count", () => {
    const result = render();
    expect(result.current.resultLine).toBe("All 8 listings");

    act(() => result.current.onQuery("portrait"));

    expect(titles(result)).toEqual(expect.arrayContaining(["Harmattan Portrait Session", "Freedom Park Portraits"]));
    expect(result.current.rows).toHaveLength(2);
    expect(result.current.resultLine).toBe("2 listings");
    expect(result.current.hasFilters).toBe(true);
  });

  it("filters by status, rating and category with a nested subcategory, and describes each", () => {
    const result = render();
    const group = (key: string) => result.current.groups.find((g) => g.key === key)!;
    expect(group("status").current).toBe("Any");

    act(() => result.current.onPick("status", "Live"));
    expect(titles(result)).toEqual(["Lagos Island Photowalk"]);
    expect(group("status")).toMatchObject({ current: "Live", active: true });
    expect(group("status").options.find((o) => o.value === "Live")!.selected).toBe(true);

    act(() => result.current.onClearFilters());
    act(() => result.current.onPick("rating", "Not rated yet"));
    expect(result.current.rows).toHaveLength(3);

    act(() => result.current.onClearFilters());
    act(() => result.current.onPick("category", "Art & creativity"));
    expect(group("category").current).toBe("Art & creativity");
    expect(group("category").options.find((o) => o.value === "Art & creativity")!.selected).toBe(true);

    act(() => result.current.onPick("category", "Water activity", "Boat cruise"));
    expect(titles(result)).toEqual(["Film Only Boat Morning"]);
    expect(group("category").current).toBe("Boat cruise");
    const water = group("category").options.find((o) => o.value === "Water activity")!;
    expect(water.selected).toBe(false);
    expect(water.subs.find((s) => s.value === "Boat cruise")!.selected).toBe(true);
  });

  it("shows the no-matches state and recovers with Show everything", () => {
    const result = render();
    act(() => result.current.onPick("status", "Live"));
    act(() => result.current.onPick("category", "Street life"));

    expect(result.current.rows).toEqual([]);
    expect(result.current.noMatches).toBe(true);
    expect(result.current.resultLine).toBe("0 listings");

    act(() => result.current.onShowEverything());
    expect(result.current.rows).toHaveLength(8);
    expect(result.current.noMatches).toBe(false);
    expect(result.current.hasFilters).toBe(false);
  });
});

describe("sorting", () => {
  it("starts on the next date, flips direction on the same column, and restarts on a new one", () => {
    const result = render();
    expect(result.current.columns.find((c) => c.key === "next")!.direction).toBe("asc");

    act(() => result.current.onSort("next"));
    expect(result.current.columns.find((c) => c.key === "next")!.direction).toBe("desc");

    act(() => result.current.onSort("price"));
    expect(result.current.columns.find((c) => c.key === "price")!.direction).toBe("asc");
    expect(result.current.columns.find((c) => c.key === "next")!.direction).toBeNull();
    expect(result.current.rows.map((r) => r.price)[0]).toBe("₦7,500");

    act(() => result.current.onSort("price"));
    expect(result.current.rows[0].price).toBe("₦18,000");
  });
});

describe("selection and bulk actions", () => {
  it("selects rows and all rows, and clears", () => {
    const result = render();
    expect(result.current.selection.count).toBe(0);

    act(() => result.current.selection.onToggleRow("l1"));
    act(() => result.current.selection.onToggleRow("l2"));
    expect(result.current.selection.label).toBe("2 listings selected");
    expect(result.current.rows.filter((r) => r.selected)).toHaveLength(2);

    act(() => result.current.selection.onToggleRow("l2"));
    expect(result.current.selection.label).toBe("1 listing selected");

    act(() => result.current.selection.onToggleAll());
    expect(result.current.selection.allSelected).toBe(true);
    expect(result.current.selection.count).toBe(8);
    act(() => result.current.selection.onToggleAll());
    expect(result.current.selection.count).toBe(0);

    act(() => result.current.selection.onToggleRow("l1"));
    act(() => result.current.selection.onClear());
    expect(result.current.selection.count).toBe(0);
  });

  it("starts a fresh selection when the filters change", () => {
    const result = render();
    act(() => result.current.selection.onToggleRow("l1"));
    act(() => result.current.onPick("status", "Draft"));
    expect(result.current.selection.count).toBe(0);
  });

  it("only counts selected rows that are still shown", () => {
    const result = render();
    act(() => result.current.selection.onToggleAll());
    act(() => result.current.onQuery("kayak"));
    expect(result.current.selection.count).toBe(0);
  });

  it("clears the selection after a bulk action and says it isn't connected yet", () => {
    const result = render();
    act(() => result.current.selection.onToggleRow("l1"));

    act(() => result.current.selection.onBulk("archive"));

    expect(toast.info).toHaveBeenCalled();
    expect(result.current.selection.count).toBe(0);
  });
});

describe("row actions", () => {
  const listing = SAMPLE_LISTINGS[0];

  it("opens the details for See details, and the builder for a draft", () => {
    const result = render();
    act(() => result.current.onRowAction(listing, "details"));
    expect(nav.push).toHaveBeenCalledWith("/host/dashboard/listings/l1");
    act(() => result.current.onRowAction(SAMPLE_LISTINGS[3], "details"));
    expect(nav.push).toHaveBeenLastCalledWith("/host/dashboard/listings/new");
  });

  it("opens the builder for Edit", () => {
    const result = render();
    act(() => result.current.onRowAction(listing, "edit"));
    expect(nav.push).toHaveBeenCalledWith("/host/dashboard/listings/new");
  });

  it("previews the guest page in a new tab", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const result = render();
    act(() => result.current.onRowAction(listing, "preview"));
    expect(open).toHaveBeenCalledWith("/experiences/l1", "_blank", "noopener");
    open.mockRestore();
  });

  it("copies the guest link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const result = render();

    await act(async () => result.current.onRowAction(listing, "copy-link"));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/experiences/l1`);
    expect(toast.success).toHaveBeenCalledWith("Link copied");
  });

  it("says so when the link can't be copied", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("no")) } });
    const result = render();
    await act(async () => result.current.onRowAction(listing, "copy-link"));
    expect(toast.error).toHaveBeenCalled();
  });

  it("says the rest aren't connected yet", () => {
    const result = render();
    for (const action of ["duplicate", "hide", "show", "pause", "archive"] as const) {
      act(() => result.current.onRowAction(listing, action));
    }
    expect(toast.info).toHaveBeenCalledTimes(5);
  });

  it("blocks deleting a listing that still has bookings to come", () => {
    const result = render();
    act(() => result.current.onRowAction(listing, "delete"));
    expect(result.current.dialog).toEqual({ kind: "blocked", title: "Lagos Island Photowalk", upcoming: 4 });

    act(() => result.current.onCloseDialog());
    expect(result.current.dialog).toBeNull();
  });

  it("warns about what deleting loses when nothing is coming up", () => {
    const result = render();
    act(() => result.current.onRowAction(SAMPLE_LISTINGS[2], "delete"));
    expect(result.current.dialog).toEqual({ kind: "ok", title: "Harmattan Portrait Session", rating: "4.9" });

    act(() => result.current.onRowAction(SAMPLE_LISTINGS[3], "delete"));
    expect(result.current.dialog).toMatchObject({ kind: "ok", rating: null });

    act(() => result.current.onDialogConfirm());
    expect(toast.info).toHaveBeenCalled();
    expect(result.current.dialog).toBeNull();
  });
});
