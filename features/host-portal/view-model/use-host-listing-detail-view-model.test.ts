import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useHostListingDetailViewModel } from "./use-host-listing-detail-view-model";

const nav = vi.hoisted(() => ({ push: vi.fn(), preview: "full" as string | null }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => new URLSearchParams(nav.preview ? `preview=${nav.preview}` : ""),
}));
const toast = vi.hoisted(() => ({ info: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  window.localStorage.clear();
  nav.preview = "full";
  nav.push.mockReset();
  Object.values(toast).forEach((t) => t.mockReset());
});

const render = (id: string) => renderHook(() => useHostListingDetailViewModel(id)).result;

describe("a live listing", () => {
  it("has the header, no banner, four stats and the coming-up dates", () => {
    const { current } = render("l1");
    expect(current.header).toMatchObject({ title: "Lagos Island Photowalk", chip: "Live" });
    expect(current.header.actions[0]).toMatchObject({ label: "Edit listing", href: "/host/dashboard/listings/new" });
    expect(current.banner).toBeNull();
    expect(current.stats).toHaveLength(4);
    expect(current.dates.map((d) => d.seats)).toEqual(["6 of 8 booked", "3 of 8 booked", "1 of 8 booked", "No bookings yet, 8 places free", "All 8 places taken"]);
    expect(current.next).toMatchObject({ title: "Sat 20 Sept", meta: "Tomorrow, 16:00 · 6 of 8 booked" });
    expect(current.pay.net).toBe("₦68,000");
    expect(current.meetCue).toBe("The yellow gate beside Freedom Park");
  });

  it("switches between About, Reviews and Rules and settings", () => {
    const result = render("l1");
    expect(result.current.tab).toBe("About");
    act(() => result.current.tabs[1].onSelect());
    expect(result.current.tab).toBe("Reviews");
    expect(result.current.reviews[0]).toMatchObject({ name: "Ifeoma A.", stars: "★★★★★" });
    act(() => result.current.tabs[2].onSelect());
    expect(result.current.rules).toHaveLength(7);
    expect(result.current.rules[0].label).toBe("How people book");
  });

  it("sends actions where they belong", () => {
    const result = render("l1");
    const click = (label: string) => act(() => result.current.actions.find((a) => a.label === label)!.onClick());
    click("Edit this listing");
    expect(nav.push).toHaveBeenLastCalledWith("/host/dashboard/listings/new");
    click("Block a date");
    expect(nav.push).toHaveBeenLastCalledWith("/host/dashboard/calendar");
    act(() => result.current.next!.onGuests());
    expect(nav.push).toHaveBeenLastCalledWith("/host/dashboard/bookings");
    click("Pause new bookings");
    expect(toast.info).toHaveBeenCalled();
  });

  it("copies the guest link", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const result = render("l1");
    await act(async () => result.current.actions.find((a) => a.label === "Copy the guest link")!.onClick());
    expect(toast.success).toHaveBeenCalledWith("Link copied");
  });

  it("says so when the link can't be copied", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("no")) } });
    const result = render("l1");
    await act(async () => result.current.actions.find((a) => a.label === "Copy the guest link")!.onClick());
    expect(toast.error).toHaveBeenCalled();
  });
});

describe("the other statuses", () => {
  it.each([
    ["l2", "amber", "In review", "Edit listing"],
    ["l3", "grey", "Archived", "Duplicate this listing"],
    ["l5", "blue", "Sold out on Sun 21 Sept", "See guests"],
    ["l6", "grey", "Hidden from search", "Show in search"],
    ["l7", "amber", "Paused until 1 October", "Resume now"],
    ["l8", "red", "Not approved yet", "Fix and resubmit"],
  ])("%s shows its banner", (id, tone, title, button) => {
    expect(render(id).current.banner).toMatchObject({ tone, title, button });
  });

  it("an in-review listing has no dates, no reviews and no next date", () => {
    const { current } = render("l2");
    expect(current.dates).toEqual([]);
    expect(current.next).toBeNull();
    expect(current.detail?.noDates).toMatch(/once the listing is approved/);
  });

  it("an archived listing has no Edit listing in the header", () => {
    expect(render("l3").current.header.actions).toEqual([]);
  });

  it("the banner button runs its action", () => {
    const rejected = render("l8");
    act(() => rejected.current.banner!.onButton());
    expect(nav.push).toHaveBeenLastCalledWith("/host/dashboard/listings/new");

    const soldOut = render("l5");
    act(() => soldOut.current.banner!.onButton());
    expect(nav.push).toHaveBeenLastCalledWith("/host/dashboard/bookings");

    const paused = render("l7");
    act(() => paused.current.banner!.onButton());
    expect(toast.info).toHaveBeenCalled();
  });
});

describe("a listing that isn't there", () => {
  it("is not found for an unknown id and for a host with nothing", () => {
    expect(render("zzz").current.notFound).toBe(true);
    nav.preview = null;
    window.localStorage.clear();
    expect(render("l1").current.notFound).toBe(true);
  });
});
