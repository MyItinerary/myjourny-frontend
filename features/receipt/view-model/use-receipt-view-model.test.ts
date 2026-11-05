import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useReceiptViewModel } from "./use-receipt-view-model";

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("../model/receipt-api", () => ({
  useReceiptQuery: () => ({
    data: undefined,
    isLoading: false,
  }),
}));

describe("useReceiptViewModel", () => {
  beforeEach(() => {
    toastSuccess.mockClear();
    toastError.mockClear();
  });

  it("returns default SAMPLE_RECEIPT when no data is loaded", () => {
    const { result } = renderHook(() => useReceiptViewModel());

    expect(result.current.receipt.orderNumber).toBe("MJ-EV-48213");
    expect(result.current.receipt.billedTo).toBe("Ireti George");
    expect(result.current.isEmailing).toBe(false);
    expect(result.current.isDownloading).toBe(false);
  });

  it("triggers print on onDownloadPdf when no receiptUrl is present", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    const { result } = renderHook(() => useReceiptViewModel());

    act(() => {
      result.current.onDownloadPdf();
    });

    expect(printSpy).toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith("Opening receipt PDF...");
    printSpy.mockRestore();
  });

  it("triggers window.open on onDownloadPdf when receiptUrl exists", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const { result } = renderHook(() =>
      useReceiptViewModel({
        initialData: {
          orderNumber: "MJ-123",
          paymentReference: "REF-123",
          billedTo: "Test User",
          paidAmount: 5000,
          currency: "NGN",
          paidAtFormatted: "Today",
          experienceTitle: "Test",
          experienceLocation: "Lagos",
          sessionDateTimeFormatted: "Today",
          meetingLocation: "Lagos",
          totalPriceFormatted: "₦5,000",
          receiptUrl: "https://example.com/receipt.pdf",
        },
      })
    );

    act(() => {
      result.current.onDownloadPdf();
    });

    expect(openSpy).toHaveBeenCalledWith("https://example.com/receipt.pdf", "_blank");
    openSpy.mockRestore();
  });

  it("handles onEmailCopy successfully", async () => {
    const { result } = renderHook(() => useReceiptViewModel());

    await act(async () => {
      await result.current.onEmailCopy();
    });

    expect(toastSuccess).toHaveBeenCalledWith("Receipt emailed to your address");
    expect(result.current.isEmailing).toBe(false);
  });
});
