import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useReceiptQuery } from "../model/receipt-api";
import type { ReceiptData } from "../model/receipt.types";

export interface ReceiptViewModel {
  receipt: ReceiptData | null;
  isLoading: boolean;
  isError: boolean;
  errorStatus: number | null;
  bookingId?: string;
  isDownloading: boolean;
  refetch: () => void;
  onDownloadPdf: () => void;
}

export interface UseReceiptViewModelOptions {
  bookingId?: string;
}

export function useReceiptViewModel(options?: UseReceiptViewModelOptions): ReceiptViewModel {
  const bookingId = options?.bookingId;
  const { data, isLoading, isError, error, refetch } = useReceiptQuery(bookingId);
  const [isDownloading, setIsDownloading] = useState(false);

  const receipt = data ?? null;

  const errorStatus =
    (error as { response?: { status?: number } } | null)?.response?.status ??
    (isError ? 500 : null);

  const onDownloadPdf = useCallback(() => {
    if (!receipt) return;
    setIsDownloading(true);
    try {
      if (typeof window !== "undefined") {
        if (receipt.receiptUrl) {
          window.open(receipt.receiptUrl, "_blank", "noopener,noreferrer");
          toast.success("Opening receipt PDF...");
        } else {
          window.print();
          toast.info("Print dialog opened");
        }
      }
    } catch {
      toast.error("Could not download receipt. Please try printing the page.");
    } finally {
      setIsDownloading(false);
    }
  }, [receipt]);

  return {
    receipt,
    isLoading,
    isError: !receipt && (isError || !bookingId),
    errorStatus: !bookingId ? 404 : errorStatus,
    bookingId,
    isDownloading,
    refetch,
    onDownloadPdf,
  };
}
