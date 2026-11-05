import { describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api-client";
import { fetchReceipt, mapBookingToReceipt } from "./receipt-api";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("receipt-api", () => {
  it("fetches booking by id and maps to ReceiptData", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        id: "b-12345",
        paystack_reference: "REF-123",
        experience_title: "Kayaking Adventure",
        party_size: 2,
        price_total: "32000",
        payment_status: "paid",
        created_at: "2026-10-21T14:32:00Z",
        user_full_name: "Tunde Ednut",
      },
    });

    const data = await fetchReceipt("b-12345");
    expect(data.orderNumber).toBeNull();
    expect(data.paidAtFormatted).toBeNull();
    expect(data.paymentReference).toBe("REF-123");
    expect(data.billedTo).toBe("Tunde Ednut");
    expect(data.totalPriceFormatted).toMatch(/32,000/);
    expect(data.partySizeLabel).toBe("2 guests");
    expect(data.status).toBe("paid");
  });

  it("only keeps an http(s) receipt link", () => {
    const withUrl = (receipt_url: string) => mapBookingToReceipt({ id: "b-1", receipt_url }).receiptUrl;

    expect(withUrl("https://example.com/receipt.pdf")).toBe("https://example.com/receipt.pdf");
    expect(withUrl("javascript:alert(1)")).toBeNull();
    expect(withUrl("data:text/html,hi")).toBeNull();
    expect(withUrl("not a url")).toBeNull();
  });

  it("propagates error when API call fails", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("404 Not Found"));
    await expect(fetchReceipt("invalid-id")).rejects.toThrow("404 Not Found");
  });

  it("handles missing identifiers and statuses without inventing data", () => {
    const mapped = mapBookingToReceipt({
      id: "b-neutral",
      requested_datetime: "2026-11-14T09:00:00Z",
      meeting_point: null,
      payment_status: "refunded",
    });

    expect(mapped.orderNumber).toBeNull();
    expect(mapped.paymentReference).toBeNull();
    expect(mapped.billedTo).toBeNull();
    expect(mapped.meetingLocation).toBeNull();
    expect(mapped.sessionDateTimeFormatted).not.toContain("5:00 PM");
    expect(mapped.partySizeLabel).toBeNull();
    expect(mapped.taxesAndFeesNote).toBeNull();
    expect(mapped.status).toBe("refunded");
    expect(mapped.paidAtFormatted).toBeNull();
    expect(mapped.paidAmount).toBeNull();
    expect(mapped.totalPriceFormatted).toBeNull();
  });

  it("maps missing or unparsable price_total to null instead of inventing zero amount", () => {
    const nullPrice = mapBookingToReceipt({
      id: "b-null-price",
      currency: "USD",
      price_total: null,
    });
    expect(nullPrice.paidAmount).toBeNull();
    expect(nullPrice.totalPriceFormatted).toBeNull();

    const invalidPrice = mapBookingToReceipt({
      id: "b-invalid-price",
      currency: "NGN",
      price_total: "not-a-number",
    });
    expect(invalidPrice.paidAmount).toBeNull();
    expect(invalidPrice.totalPriceFormatted).toBeNull();

    const validZeroPrice = mapBookingToReceipt({
      id: "b-zero-price",
      currency: "USD",
      price_total: 0,
    });
    expect(validZeroPrice.paidAmount).toBe(0);
    expect(validZeroPrice.totalPriceFormatted).toBe("$0");
  });
});
