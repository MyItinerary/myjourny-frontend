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
    expect(data.orderNumber).toBe("b-12345");
    expect(data.paymentReference).toBe("REF-123");
    expect(data.billedTo).toBe("Tunde Ednut");
    expect(data.totalPriceFormatted).toMatch(/32,000/);
    expect(data.partySizeLabel).toBe("2 guests");
    expect(data.status).toBe("paid");
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

    expect(mapped.orderNumber).toBe("b-neutral");
    expect(mapped.paymentReference).toBeNull();
    expect(mapped.billedTo).toBeNull();
    expect(mapped.meetingLocation).toBeNull();
    expect(mapped.sessionDateTimeFormatted).not.toContain("5:00 PM");
    expect(mapped.partySizeLabel).toBeNull();
    expect(mapped.taxesAndFeesNote).toBeNull();
    expect(mapped.status).toBe("refunded");
    expect(mapped.paidAtFormatted).toBeNull();
  });
});
