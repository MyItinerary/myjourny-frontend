import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useReceiptQuery } from "../model/receipt-api";
import { type ReceiptData, SAMPLE_RECEIPT } from "../model/receipt.types";

export interface ReceiptViewModel {
  receipt: ReceiptData;
  isLoading: boolean;
  isEmailing: boolean;
  isDownloading: boolean;
  onDownloadPdf: () => void;
  onEmailCopy: () => void;
}

export interface UseReceiptViewModelOptions {
  bookingId?: string;
  initialData?: ReceiptData;
}

export function useReceiptViewModel(options?: UseReceiptViewModelOptions): ReceiptViewModel {
  const bookingId = options?.bookingId;
  const { data, isLoading } = useReceiptQuery(bookingId);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const receipt = options?.initialData ?? data ?? SAMPLE_RECEIPT;

  const onDownloadPdf = useCallback(() => {
    setIsDownloading(true);
    try {
      if (typeof window !== "undefined") {
        if (receipt.receiptUrl) {
          window.open(receipt.receiptUrl, "_blank");
        } else {
          window.print();
        }
      }
      toast.success("Opening receipt PDF...");
    } catch {
      toast.error("Could not download receipt. Please try printing the page.");
    } finally {
      setIsDownloading(false);
    }
  }, [receipt.receiptUrl]);

  const onEmailCopy = useCallback(async () => {
    setIsEmailing(true);
    try {
      // Simulate network request for emailing copy
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Receipt emailed to your address");
    } catch {
      toast.error("Could not send receipt email. Please try again.");
    } finally {
      setIsEmailing(false);
    }
  }, []);

  return {
    receipt,
    isLoading,
    isEmailing,
    isDownloading,
    onDownloadPdf,
    onEmailCopy,
  };
}
