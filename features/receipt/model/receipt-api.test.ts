import { describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api-client";
import { fetchReceipt, mapBookingToReceipt } from "./receipt-api";
import { SAMPLE_RECEIPT } from "./receipt.types";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("receipt-api", () => {
  it("returns SAMPLE_RECEIPT for sample bookingId", async () => {
    const data = await fetchReceipt("sample");
    expect(data.orderNumber).toBe(SAMPLE_RECEIPT.orderNumber);
    expect(data.experienceTitle).toBe(SAMPLE_RECEIPT.experienceTitle);
  });

  it("maps ApiBookingResponse to ReceiptData correctly", () => {
    const mapped = mapBookingToReceipt({
      id: "abcde-12345",
      paystack_reference: "REF-999",
      experience_title: "Kayaking Adventure",
      party_size: 2,
      price_total: "32000",
      payment_status: "paid",
      created_at: "2026-10-21T14:32:00Z",
      user_full_name: "Tunde Ednut",
    });

    expect(mapped.orderNumber).toBe("MJ-EV-ABCDE");
    expect(mapped.paymentReference).toBe("REF-999");
    expect(mapped.billedTo).toBe("Tunde Ednut");
    expect(mapped.totalPriceFormatted).toMatch(/32,000/);
    expect(mapped.partySizeLabel).toBe("2 Adults");
  });

  it("handles fallback on API error", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Network error"));
    const data = await fetchReceipt("custom-id-99");
    expect(data.orderNumber).toBe("MJ-EV-CUSTO");
  });
});
