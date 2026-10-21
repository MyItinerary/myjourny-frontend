import { describe, expect, it } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useBookingDayDetailsViewModel } from "./use-booking-day-details-view-model";

describe("useBookingDayDetailsViewModel", () => {
  it("shows the meeting section and downloads for a confirmed, paid booking", () => {
    const { result } = renderHookWithProviders(() =>
      useBookingDayDetailsViewModel({
        meeting_point: { instructions: "By the blue kiosk" },
        receipt_url: "https://api.example.com/bookings/b1/receipt.pdf?token=t",
      }),
    );

    expect(result.current.showMeeting).toBe(true);
    expect(result.current.showDownloads).toBe(true);
    expect(result.current.details.meetingInstructions).toBe("By the blue kiosk");
  });

  it("hides both sections for a booking with none of these details yet", () => {
    const { result } = renderHookWithProviders(() => useBookingDayDetailsViewModel({}));

    expect(result.current.showMeeting).toBe(false);
    expect(result.current.showDownloads).toBe(false);
  });
});
