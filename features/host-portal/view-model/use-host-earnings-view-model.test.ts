import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHostEarningsViewModel } from "./use-host-earnings-view-model";

const nav = vi.hoisted(() => ({ preview: "full" as string | null, quiet: false }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(nav.preview ? `preview=${nav.preview}` : ""),
}));
vi.mock("../model/earnings-data", async (importOriginal) => {
  const real = await importOriginal<typeof import("../model/earnings-data")>();
  const { sampleEarnings } = await import("../model/sample-earnings");
  return {
    ...real,
    // quiet: earnings exist, but none fall in any range.
    useHostEarnings: (preview: string | null, today: string | null) =>
      nav.quiet && preview === "full" && today ? { ...sampleEarnings(today), transactions: [] } : real.useHostEarnings(preview, today),
  };
});
const toast = vi.hoisted(() => ({ info: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

// Today is Saturday 19 September 2026.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 19, 10, 0));
  nav.preview = "full";
  nav.quiet = false;
  toast.info.mockReset();
});
afterEach(() => vi.useRealTimers());

const render = () => renderHook(() => useHostEarningsViewModel()).result;
const refs = (result: { current: ReturnType<typeof useHostEarningsViewModel> }) => result.current.rows.map((r) => r.ref);

describe("with earnings", () => {
  it("summarises the month, words the range, and shows the numbers", () => {
    const { current } = render();

    expect(current.ready).toBe(true);
    expect(current.header.title).toBe("Earnings");
    expect(current.header.subtitle).toBe("₦248,000 this month · ₦68,000 clearing");
    expect(current.range).toBe("This month");
    expect(current.rangeLabel).toBe("1 to 30 September 2026");
    expect(current.stats.map((s) => s.label)).toEqual(["Earned all time", "Clearing now", "Already paid out", "Next payout"]);
    expect(current.commissionHeading).toBe("Our 15 percent");
    expect(current.none).toBe(false);
  });

  it("lists this month's bookings with what we took", () => {
    const { current } = render();
    expect(current.rows.map((r) => r.ref)).toEqual(["MJ-4471", "MJ-4468", "MJ-4455", "MJ-4502", "MJ-4503"]);
    expect(current.rows[0]).toMatchObject({ gross: "₦40,000", commission: "- ₦6,000", net: "₦34,000", status: "Cleared" });
  });

  it("changes range, relabelling and refiltering", () => {
    const result = render();
    expect(result.current.ranges.find((r) => r.selected)!.value).toBe("This month");

    act(() => result.current.onRange("Last month"));
    expect(result.current.rangeLabel).toBe("1 to 31 August 2026");
    expect(refs(result)).toEqual(["MJ-4431"]);

    act(() => result.current.onRange("Everything"));
    expect(result.current.rangeLabel).toBe("March 2026 to today");
    expect(result.current.rows).toHaveLength(6);

    act(() => result.current.onRange("Last 3 months"));
    expect(result.current.rangeLabel).toBe("1 July to 30 September 2026");
    expect(result.current.rows).toHaveLength(6);
  });

  it("says when a range has nothing in it", () => {
    nav.quiet = true;
    const { current } = render();

    expect(current.header.subtitle).toBe("₦248,000 this month · ₦68,000 clearing");
    expect(current.rows).toEqual([]);
    expect(current.none).toBe(true);
    expect(current.noneMessage).toBe("Nothing earned in this range.");
  });
});

describe("downloading a statement", () => {
  it("saves a CSV of the bookings shown", async () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:statement");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const result = render();

    act(() => result.current.onDownload());

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/csv;charset=utf-8");
    expect(await blob.text()).toContain("MJ-4471");
    expect(await blob.text()).not.toContain("MJ-4431");
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:statement");
    click.mockRestore();
  });

  it("is the same action as the header button", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    Object.assign(URL, { createObjectURL: vi.fn().mockReturnValue("blob:x"), revokeObjectURL: vi.fn() });
    const result = render();
    act(() => result.current.header.actions[0].onClick?.());
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it("says when there's nothing to put in it", () => {
    nav.preview = null;
    const result = render();
    act(() => result.current.onDownload());
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining("nothing in this range"));
  });
});

describe("with no earnings", () => {
  it("shows zeros and says what will appear", () => {
    nav.preview = null;
    const { current } = render();

    expect(current.header.subtitle).toBe("Nothing earned yet");
    expect(current.stats.map((s) => s.value)).toEqual(["₦0", "₦0", "₦0", "None yet"]);
    expect(current.rows).toEqual([]);
    expect(current.none).toBe(true);
    expect(current.noneMessage).toMatch(/When a guest books and pays/);
    expect(current.rangeLabel).toBe("1 to 30 September 2026");
  });
});
