import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EarningsBooking, EarningsTotal } from "../model/earnings.types";
import { useHostEarningsViewModel } from "./use-host-earnings-view-model";

const query = vi.hoisted(() => ({
  response: {
    totals: [
      { currency: "NGN", earned: "48000.00", pending: "15000.00", paid_out: "33000.00" },
      { currency: "USD", earned: "120.00", pending: "120.00", paid_out: "0.00" },
    ],
    bookings: [
      {
        booking_id: "booking-1", experience_title: "Lagos food walk", session_at: "2026-11-29T15:00:00",
        currency: "NGN", earned: "30000.00", pending: "0.00", paid_out: "30000.00", payout_status: "paid" as const,
      },
      {
        booking_id: "booking-2", experience_title: "Lagos art tour", session_at: "2026-12-03T17:00:00",
        currency: "NGN", earned: "18000.00", pending: "15000.00", paid_out: "3000.00", payout_status: "partial" as const,
      },
    ],
  } as { totals: EarningsTotal[]; bookings: EarningsBooking[] },
  isPending: false,
  isError: false,
  error: null as unknown,
}));
vi.mock("../model/earnings-data", () => ({ useHostEarnings: () => ({ data: query.response, isPending: query.isPending, isError: query.isError, error: query.error }) }));
const toast = vi.hoisted(() => ({ info: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  query.isPending = false;
  query.isError = false;
  query.error = null;
  toast.info.mockReset();
});

const render = () => renderHook(() => useHostEarningsViewModel()).result;

describe("useHostEarningsViewModel", () => {
  it("shows totals separately for each currency and maps ledger booking lines", () => {
    const { current } = render();

    expect(current.header).toMatchObject({ title: "Earnings", subtitle: "Ledger totals, shown separately by currency" });
    expect(current.stats.map((stat) => [stat.label, stat.value])).toEqual([
      ["NGN earned", "₦48,000"], ["NGN pending", "₦15,000"], ["NGN paid out", "₦33,000"],
      ["USD earned", "$120"], ["USD pending", "$120"], ["USD paid out", "$0"],
    ]);
    expect(current.rows[0]).toEqual({
      id: "booking-1", booking: "booking-1", experience: "Lagos food walk", date: "29 Nov 2026", currency: "NGN",
      earned: "₦30,000", pending: "₦0", paidOut: "₦30,000", status: "paid", statusLabel: "Paid",
    });
    expect(current.rows[1].status).toBe("partial");
    expect(current.none).toBe(false);
  });

  it("downloads a CSV statement containing the backend earnings", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    Object.assign(URL, { createObjectURL: vi.fn().mockReturnValue("blob:statement"), revokeObjectURL: vi.fn() });
    const { current } = render();

    act(() => current.onDownload());
    const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
    expect(await blob.text()).toContain("booking-1,Lagos food walk");
    expect(click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:statement");
    click.mockRestore();
  });

  it("shows loading and error states without presenting them as empty earnings", () => {
    query.isPending = true;
    expect(render().current).toMatchObject({ loading: true, header: { subtitle: "Loading your earnings" } });

    query.isPending = false;
    query.isError = true;
    query.error = { response: { data: { detail: "Session expired" } } };
    expect(render().current).toMatchObject({
      error: "Session expired",
      header: { subtitle: "Your earnings could not be loaded" },
      noneMessage: "Your earnings could not be loaded. Please try again.",
      none: true,
    });
  });

  it("handles an empty ledger and an empty statement", () => {
    query.response = { totals: [], bookings: [] };
    const { current } = render();
    expect(current.header.subtitle).toBe("Nothing earned yet");
    expect(current.stats).toEqual([]);
    expect(current.noneMessage).toContain("ledger amounts");

    act(() => current.onDownload());
    expect(toast.info).toHaveBeenCalledWith("There's nothing to put in a statement yet.");
  });
});
