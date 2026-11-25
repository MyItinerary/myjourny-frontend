import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_RECEIPT } from "../model/receipt.test-fixtures";
import { useReceiptViewModel } from "./use-receipt-view-model";

const toastSuccess = vi.fn();
const toastInfo = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    info: (...args: unknown[]) => toastInfo(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("../model/receipt-api", () => ({
  useReceiptQuery: (bookingId?: string) => {
    if (bookingId === "error-401") {
      return {
        data: undefined,
        isLoading: false,
        isError: true,
        error: { response: { status: 401 } },
        refetch: vi.fn(),
      };
    }
    if (bookingId === "error-404") {
      return {
        data: undefined,
        isLoading: false,
        isError: true,
        error: { response: { status: 404 } },
        refetch: vi.fn(),
      };
    }
    if (bookingId === "success-id") {
      return {
        data: SAMPLE_RECEIPT,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }
    if (bookingId === "no-pdf-id") {
      return {
        data: { ...SAMPLE_RECEIPT, receiptUrl: null },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }
    if (bookingId === "pdf-id") {
      return {
        data: { ...SAMPLE_RECEIPT, receiptUrl: "https://example.com/receipt.pdf" },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }
    return {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
  },
}));

describe("useReceiptViewModel", () => {
  beforeEach(() => {
    toastSuccess.mockClear();
    toastInfo.mockClear();
    toastError.mockClear();
  });

  it("handles loading state without flashing fake data", () => {
    const { result } = renderHook(() => useReceiptViewModel({ bookingId: "loading-id" }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.receipt).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it("identifies 401 unauthorized status", () => {
    const { result } = renderHook(() => useReceiptViewModel({ bookingId: "error-401" }));

    expect(result.current.isError).toBe(true);
    expect(result.current.errorStatus).toBe(401);
    expect(result.current.receipt).toBeNull();
  });

  it("identifies 404 not found status", () => {
    const { result } = renderHook(() => useReceiptViewModel({ bookingId: "error-404" }));

    expect(result.current.isError).toBe(true);
    expect(result.current.errorStatus).toBe(404);
    expect(result.current.receipt).toBeNull();
  });

  it("loads receipt data on success", () => {
    const { result } = renderHook(() => useReceiptViewModel({ bookingId: "success-id" }));

    expect(result.current.receipt?.orderNumber).toBe("MJ-EV-48213");
    expect(result.current.receipt?.billedTo).toBe("Ireti George");
    expect(result.current.isError).toBe(false);
  });

  it("triggers window.print and info toast when receiptUrl is null", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    const { result } = renderHook(() => useReceiptViewModel({ bookingId: "no-pdf-id" }));

    act(() => {
      result.current.onDownloadPdf();
    });

    expect(printSpy).toHaveBeenCalled();
    expect(toastInfo).toHaveBeenCalledWith("Print dialog opened");
    printSpy.mockRestore();
  });

  it("triggers window.open with noopener,noreferrer when receiptUrl exists", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const { result } = renderHook(() => useReceiptViewModel({ bookingId: "pdf-id" }));

    act(() => {
      result.current.onDownloadPdf();
    });

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/receipt.pdf",
      "_blank",
      "noopener,noreferrer"
    );
    expect(toastSuccess).toHaveBeenCalledWith("Opening receipt PDF...");
    openSpy.mockRestore();
  });
});
