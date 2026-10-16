import { describe, expect, it } from "vitest";

import { hasMeetingDetails, toBookingDayDetails } from "./booking-day-details";

describe("toBookingDayDetails", () => {
  it("turns a confirmed booking's details into what the page shows", () => {
    const details = toBookingDayDetails({
      meeting_point: {
        latitude: 6.4281,
        longitude: 3.4219,
        instructions: "  Lekki Phase 1 jetty, by the blue kiosk ",
        city: "Lagos",
        country: "Nigeria",
      },
      what_to_bring: "Swimwear and sunscreen",
      host_phone: "+234 803 000 0000",
      receipt_url: "https://api.myjourny.io/bookings/b1/receipt.pdf?token=abc",
      calendar_url: "https://api.myjourny.io/bookings/b1/calendar.ics?token=def",
    });

    expect(details).toEqual({
      meetingInstructions: "Lekki Phase 1 jetty, by the blue kiosk",
      meetingArea: "Lagos, Nigeria",
      mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=6.4281,3.4219",
      whatToBring: "Swimwear and sunscreen",
      hostPhone: "+234 803 000 0000",
      hostPhoneHref: "tel:+2348030000000",
      calendarUrl: "https://api.myjourny.io/bookings/b1/calendar.ics?token=def",
      receiptUrl: "https://api.myjourny.io/bookings/b1/receipt.pdf?token=abc",
    });
    expect(hasMeetingDetails(details)).toBe(true);
  });

  it("leaves everything empty before the booking is confirmed", () => {
    const details = toBookingDayDetails({});

    expect(Object.values(details).every((value) => value === null)).toBe(true);
    expect(hasMeetingDetails(details)).toBe(false);
  });

  it("gives no map link without both coordinates", () => {
    const details = toBookingDayDetails({ meeting_point: { latitude: 6.4, longitude: null, instructions: "By the gate" } });

    expect(details.mapsUrl).toBeNull();
    expect(details.meetingInstructions).toBe("By the gate");
  });

  it("ignores download links that aren't https", () => {
    const details = toBookingDayDetails({
      receipt_url: "javascript:alert(1)",
      calendar_url: "http://api.example.com/calendar.ics",
    });

    expect(details.receiptUrl).toBeNull();
    expect(details.calendarUrl).toBeNull();
  });
});
