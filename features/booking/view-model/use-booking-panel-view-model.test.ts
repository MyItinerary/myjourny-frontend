import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { dateKey } from "../model/sessions";
import { useBookingPanelViewModel } from "./use-booking-panel-view-model";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const toastError = vi.fn();
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => toastError(...args) } }));

const soon = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return dateKey(d);
})();
const startsAt = `${soon}T08:00:00Z`;
const later = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return dateKey(d);
})();

const quote = (overrides = {}) => ({
  currency: "NGN",
  lines: [
    { kind: "ticket", label: "Adult", quantity: 2, unit_amount: "5000", amount: "10000" },
    { kind: "discount", label: "SAVE10", quantity: 1, unit_amount: "-1000", amount: "-1000" },
  ],
  subtotal: "10000",
  discount: "1000",
  checkout_fee: "0",
  total: "9000",
  guests: 2,
  days: 1,
  promo_applied: false,
  ...overrides,
});

function stubApi({
  quoteBody = quote(),
  quoteStatus = 200,
  seatsLeft = 8,
  scheduled = true,
  lengthDays = 1,
  perDay = false,
  soldOutDay = false,
} = {}) {
  const quotes: Record<string, unknown>[] = [];
  let sessionLoads = 0;
  server.use(
    http.get(apiUrl("/experiences/exp-1/pricing"), () =>
      HttpResponse.json({
        currency: "NGN",
        prices: [{ id: "adult", label: "Adult", amount: "5000", pricing_unit: perDay ? "per_day" : "per_person" }],
        addons: [],
        rules: [],
      }),
    ),
    http.get(apiUrl("/experiences/exp-1/sessions"), () => {
      sessionLoads += 1;
      return HttpResponse.json({
        timezone: "Africa/Lagos",
        scheduled,
        length_days: lengthDays,
        sessions: scheduled
          ? [
              ...(soldOutDay
                ? [{ starts_at: `${later}T08:00:00Z`, local_date: later, local_time: "09:00:00", seats_left: 0, sold_out: true }]
                : []),
              { starts_at: startsAt, local_date: soon, local_time: "09:00:00", seats_left: seatsLeft, sold_out: false },
            ]
          : [],
      });
    }),
    http.post(apiUrl("/bookings/quote"), async ({ request }) => {
      quotes.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json(quoteBody, { status: quoteStatus });
    }),
  );
  return Object.assign(quotes, { sessionLoads: () => sessionLoads });
}

const props = {
  experienceId: "exp-1",
  guideId: "g-1",
  prices: [],
  currency: "NGN",
  durationLabel: "3 hours",
  minSpots: 2,
};

afterEach(() => {
  push.mockReset();
  toastError.mockReset();
});

describe("useBookingPanelViewModel", () => {
  it("quotes the default selection for the first session", async () => {
    const quotes = stubApi();
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));

    await waitFor(() => expect(result.current.quote).not.toBeNull());
    expect(quotes[0]).toEqual({
      experience_id: "exp-1",
      items: [{ experience_price_id: "adult", quantity: 2 }],
      addons: [],
      requested_datetime: startsAt,
    });
    // A plain booking has no breakdown, only what it saved.
    expect(result.current.card.breakdown).toEqual([{ key: "discount-0", label: "Discount", amount: "₦1,000" }]);
    expect(result.current.total).toBe("₦9,000");
    expect(result.current.booking).toMatchObject({ available: true, disabled: false, label: "Book now - ₦9,000" });
  });

  it("calls a free booking Free and offers to book it for free", async () => {
    stubApi({
      quoteBody: quote({
        lines: [{ kind: "ticket", label: "Adult", quantity: 2, unit_amount: "0", amount: "0" }],
        subtotal: "0",
        discount: "0",
        total: "0",
      }),
    });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));

    await waitFor(() => expect(result.current.quote).not.toBeNull());
    expect(result.current.card.breakdown).toEqual([]);
    expect(result.current.total).toBe("Free");
    expect(result.current.booking.label).toBe("Book for free");
  });

  it("keeps the discount's amount when a promo code covers the whole price", async () => {
    stubApi({
      quoteBody: quote({
        lines: [
          { kind: "ticket", label: "Adult", quantity: 2, unit_amount: "5000", amount: "10000" },
          { kind: "discount", label: "ALLFREE", quantity: 1, unit_amount: "-10000", amount: "-10000" },
        ],
        discount: "10000",
        total: "0",
      }),
    });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));

    await waitFor(() => expect(result.current.quote).not.toBeNull());
    expect(result.current.card.breakdown).toEqual([{ key: "discount-0", label: "Discount", amount: "₦10,000" }]);
    expect(result.current.total).toBe("Free");
    expect(result.current.booking.label).toBe("Book for free");
  });

  it("applies a promo code and reports why it didn't apply", async () => {
    const quotes = stubApi({ quoteBody: quote({ promo_code: "OLD", promo_message: "OLD has expired" }) });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.quote).not.toBeNull());

    act(() => result.current.promo.onInputChange(" old "));
    act(() => result.current.promo.onApply());

    await waitFor(() => expect(quotes.at(-1)).toMatchObject({ promo_code: "old" }));
    expect(result.current.promo.message).toEqual({ text: "OLD has expired", ok: false });
  });

  it("shows the server's reason when the selection can't be priced", async () => {
    stubApi({ quoteBody: { detail: "Choose how many days you want to book" } as never, quoteStatus: 400 });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.quoteError).toBe("Choose how many days you want to book"));
    expect(result.current.booking.disabled).toBe(true);
  });

  it("caps guests at the session's seats left", async () => {
    const quotes = stubApi({ seatsLeft: 1, quoteBody: quote({ guests: 2 }) });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.seatsWarning).toBe("Only 1 spot left for this session."));

    expect(result.current.tickets[0].max).toBe(1);
    expect(result.current.booking).toMatchObject({ disabled: true, label: "Select up to 1 guest" });
    expect(quotes).toHaveLength(0);
  });

  it("doesn't price a selection below the minimum group size", async () => {
    const quotes = stubApi();
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.total).toBe("₦9,000"));

    act(() => result.current.tickets[0].onChange(1));

    expect(result.current.minGuestsWarning).toBe("This experience needs at least 2 guests.");
    expect(result.current.card.total).toMatchObject({ amount: null, muted: "Needs 2 guests" });
    expect(result.current.quote).toBeNull();
    expect(result.current.total).toBeNull();
    expect(result.current.booking).toMatchObject({ disabled: true, label: "Select at least 2 guests" });
    expect(quotes.every((q) => (q.items as { quantity: number }[])[0].quantity === 2)).toBe(true);
  });

  it("lists the price before early-bird and every discount", async () => {
    stubApi({
      quoteBody: quote({
        lines: [
          {
            kind: "ticket",
            label: "Adult",
            quantity: 2,
            unit_amount: "4950",
            amount: "9900",
            list_unit_amount: "5000",
            list_amount: "10000",
          },
          { kind: "discount", label: "Group discount", quantity: 1, unit_amount: "-990", amount: "-990" },
          { kind: "fee", label: "Payment processing fee", quantity: 1, unit_amount: "234", amount: "234" },
        ],
        subtotal: "9900",
        subtotal_before_discounts: "10000",
        discount: "990",
        total: "9144",
        savings: [
          { kind: "early_bird", label: "Early-bird discount (1% off)", amount: "100" },
          { kind: "group", label: "Group discount (10% off 2+ guests)", amount: "990" },
        ],
      }),
    });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.quote).not.toBeNull());

    // Only the group saving gets a row; early-bird is the struck-through price, and the fee is added at checkout.
    expect(result.current.card.breakdown).toEqual([{ key: "saving-0", label: "Group saving", amount: "₦990" }]);
    expect(result.current.total).toBe("₦8,910");
  });

  it("sends the customer to checkout", async () => {
    stubApi();
    let key: string | null = null;
    server.use(
      http.post(apiUrl("/bookings/"), ({ request }) => {
        key = request.headers.get("Idempotency-Key");
        return HttpResponse.json({ id: "b-1", status: "pending", payment_status: "unpaid", url: "https://pay.test/1" });
      }),
    );
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.booking.disabled).toBe(false));

    // A writable stand-in for location, so the redirect can be read back.
    const original = window.location;
    const url = new URL(original.href);
    const standIn = {
      href: url.href,
      origin: url.origin,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
    };
    Object.defineProperty(window, "location", { configurable: true, value: standIn });
    try {
      act(() => result.current.booking.onBook());
      await waitFor(() => expect(window.location.href).toBe("https://pay.test/1"));
    } finally {
      Object.defineProperty(window, "location", { configurable: true, value: original });
    }
    expect(key).toBeTruthy();
  });

  it("goes to the success page for a free booking", async () => {
    stubApi();
    server.use(
      http.post(apiUrl("/bookings/"), () =>
        HttpResponse.json({ id: "b-2", status: "confirmed", payment_status: "unpaid", url: null }),
      ),
    );
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.booking.disabled).toBe(false));

    act(() => result.current.booking.onBook());

    await waitFor(() => expect(push).toHaveBeenCalledWith("/bookings/b-2/success"));
  });

  it("opens the confirmation page when it awaits payment without a link", async () => {
    stubApi();
    server.use(
      http.post(apiUrl("/bookings/"), () =>
        HttpResponse.json({ id: "b-3", status: "pending", payment_status: "unpaid", url: null }),
      ),
    );
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.booking.disabled).toBe(false));

    act(() => result.current.booking.onBook());

    await waitFor(() => expect(push).toHaveBeenCalledWith("/bookings/b-3/success"));
  });

  it("shows the server's reason and fresh seats when the session filled up", async () => {
    const api = stubApi();
    server.use(
      http.post(apiUrl("/bookings/"), () =>
        HttpResponse.json({ detail: "Only 1 spot left for this date" }, { status: 409 }),
      ),
    );
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.booking.disabled).toBe(false));
    const loadsBefore = api.sessionLoads();

    act(() => result.current.booking.onBook());

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Only 1 spot left for this date"));
    await waitFor(() => expect(api.sessionLoads()).toBe(loadsBefore + 1));
  });

  it("doesn't reload sessions for other errors", async () => {
    const api = stubApi();
    server.use(http.post(apiUrl("/bookings/"), () => HttpResponse.json({ detail: "Nope" }, { status: 400 })));
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.booking.disabled).toBe(false));
    const loadsBefore = api.sessionLoads();

    act(() => result.current.booking.onBook());

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Nope"));
    expect(api.sessionLoads()).toBe(loadsBefore);
  });

  it("lets a guest book without a quote and hands their picks over instead of creating a booking", async () => {
    stubApi({ quoteBody: { detail: "Not authenticated" } as never, quoteStatus: 401 });
    const created = vi.fn();
    server.use(http.post(apiUrl("/bookings/"), () => (created(), HttpResponse.json({}, { status: 201 }))));
    const onGuestBook = vi.fn();
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel({ ...props, onGuestBook }));

    await waitFor(() => expect(result.current.booking.disabled).toBe(false));
    expect(result.current.quoteError).toBeNull();

    act(() => result.current.booking.onBook());

    expect(onGuestBook).toHaveBeenCalledTimes(1);
    expect(onGuestBook.mock.calls[0][0]).toMatchObject({
      guideId: "g-1",
      guests: 2,
      ticketsLabel: "2 Adult",
      // No quote, so the price list: 2 x ₦5,000.
      total: "₦10,000",
      currency: "NGN",
      durationLabel: "3 hours",
      // One time on the day, so there are no slots to look at.
      hasTimeSlots: false,
      selection: { experience_id: "exp-1", items: [{ experience_price_id: "adult", quantity: 2 }] },
    });
    expect(onGuestBook.mock.calls[0][0].when).toContain("9:00 AM");
    expect(created).not.toHaveBeenCalled();
  });

  it("uses the server's total for a guest when the quote loads", async () => {
    stubApi();
    const onGuestBook = vi.fn();
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel({ ...props, onGuestBook }));
    await waitFor(() => expect(result.current.total).toBe("₦9,000"));

    act(() => result.current.booking.onBook());

    expect(onGuestBook.mock.calls[0][0].total).toBe("₦9,000");
  });

  it("can't be booked without a guide", async () => {
    stubApi();
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel({ ...props, guideId: null }));
    await waitFor(() => expect(result.current.quote).not.toBeNull());
    act(() => result.current.booking.onBook());
    expect(result.current.booking.available).toBe(false);
  });

  it("books an unscheduled experience by date and lets the server set the time", async () => {
    const quotes = stubApi({ scheduled: false });
    renderHookWithProviders(() => useBookingPanelViewModel(props));

    await waitFor(() => expect(quotes.length).toBeGreaterThan(0));
    expect(quotes[0]).toHaveProperty("requested_date");
    expect(quotes[0]).not.toHaveProperty("requested_datetime");
  });

  it("fixes per-day tickets to the schedule's length and shows when the session runs", async () => {
    const quotes = stubApi({
      lengthDays: 3,
      perDay: true,
      quoteBody: quote({
        days: 3,
        days_fixed: true,
        session_starts_at: "2030-06-01T08:00:00Z",
        session_ends_at: "2030-06-03T10:00:00Z",
        timezone: "Africa/Lagos",
      }),
    });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));

    await waitFor(() => expect(result.current.quote).not.toBeNull());
    expect(quotes[0]).not.toHaveProperty("days");
    expect(result.current.days.show).toBe(false);
    // Per day tickets keep their own unit; the date field names the run.
    expect(result.current.card.headline.unit).toBe("per person, per day");
  });

  it("says a per-person price covers every day of a multi-day session", async () => {
    stubApi({ lengthDays: 3 });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.card.headline.unit).toBe("per person, all 3 days"));
  });

  it("says the same 24-hour line for every experience, and keeps its own policy for the tooltip", async () => {
    stubApi();
    const withPolicy = renderHookWithProviders(() =>
      useBookingPanelViewModel({ ...props, cancellationPolicy: "  Free cancellation up to 48 hours before  " }),
    );
    await waitFor(() => expect(withPolicy.result.current.quote).not.toBeNull());
    expect(withPolicy.result.current.cancellationPolicy).toBe("Free cancellation up to 48 hours before");

    const without = renderHookWithProviders(() => useBookingPanelViewModel(props));
    expect(without.result.current.cancellationPolicy).toBeNull();
    // The card says nothing about cancelling unless the experience does.
    expect(without.result.current.card.cancellation).toEqual({
      title: "Cancellation",
      body: "You can only cancel up to 24 hours before the experience.",
      hint: null,
    });
    expect(withPolicy.result.current.card.cancellation).toEqual({
      title: "Cancellation",
      body: "You can only cancel up to 24 hours before the experience.",
      hint: "Free cancellation up to 48 hours before",
    });
  });

  it("shows only the day for an unscheduled experience, not the server's noon", async () => {
    stubApi({
      scheduled: false,
      quoteBody: quote({ session_starts_at: "2030-10-19T11:00:00Z", timezone: "Africa/Lagos" }),
    });
    const onGuestBook = vi.fn();
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel({ ...props, onGuestBook }));
    await waitFor(() => expect(result.current.quote).not.toBeNull());
    act(() => result.current.booking.onBook());
    expect(onGuestBook.mock.calls[0][0].when).toBe("Saturday, October 19");
  });
});

describe("the booking card", () => {
  it("states the price, the date with its length, and the total", async () => {
    stubApi();
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.card.total.amount).toBe("₦9,000"));

    const { card } = result.current;
    expect(card.headline).toEqual({ showFrom: false, amount: "₦5,000", unit: "per person", was: null, pill: null });
    // The stub has one time on the day, so there is no picker and the date field carries it.
    expect(card.dateField).toMatch(/ · 9:00 AM · 3 hours$/);
    expect(result.current.sessions.singleTime).toBe(true);
    expect(card.total).toEqual({ amount: "₦9,000", muted: null, fees: "Fees and taxes included" });
    expect(card.button).toMatchObject({ label: "Book now", loading: false, disabled: false });
    expect(card.cancellation.hint).toBeNull();
    expect(card.notice).toBeNull();
    expect(card.locked).toBe(false);
  });

  it("says a day is sold out, shows no total, and the button jumps to the next open day", async () => {
    stubApi({ soldOutDay: true });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.sessions.options.length).toBeGreaterThan(0));
    // The sold-out day comes first; the card opens on the first day with room.
    const nextOpen = result.current.sessions.selectedDate!;
    act(() => result.current.sessions.onSelectDate(new Date(`${later}T00:00:00`)));

    expect(result.current.card.notice).toMatchObject({ tone: "neutral", action: { kind: "dates" } });
    expect(result.current.card.notice?.title).toMatch(/^Sold out on /);
    expect(result.current.card.total).toMatchObject({ amount: null, muted: "Pick another date" });
    expect(result.current.card.button.label).toMatch(/^Jump to /);
    expect(result.current.card.button.disabled).toBe(false);

    act(() => result.current.card.button.onClick());
    expect(result.current.sessions.selectedDate).toEqual(nextOpen);
  });

  it("offers a retry when the selection can't be priced, and says nothing was charged", async () => {
    const quotes = stubApi({ quoteBody: { detail: "Pricing is down" } as never, quoteStatus: 400 });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.card.notice).not.toBeNull());

    expect(result.current.card.notice).toMatchObject({ tone: "error", action: { label: "Try again", kind: "retry" } });
    expect(result.current.card.notice?.body).toContain("Nothing has been booked or charged.");
    const before = quotes.length;
    act(() => result.current.card.onRetry());
    await waitFor(() => expect(quotes.length).toBeGreaterThan(before));
  });

  it("shows an early-bird price struck through with a pill, and no row or saving for it below", async () => {
    stubApi({
      quoteBody: quote({
        lines: [{ kind: "ticket", label: "Adult", quantity: 2, unit_amount: "4000", amount: "8000", list_unit_amount: "5000", list_amount: "10000" }],
        subtotal: "8000",
        subtotal_before_discounts: "10000",
        discount: "0",
        total: "8000",
        savings: [{ kind: "early_bird", label: "Early-bird discount (20% off)", amount: "2000" }],
      }),
    });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.quote).not.toBeNull());

    expect(result.current.card.headline).toEqual({ showFrom: false, amount: "₦4,000", unit: "per person", was: "₦5,000", pill: "Early bird" });
    expect(result.current.card.breakdown).toEqual([]);
  });

  it("shows a group discount as a lower price struck through with a pill, and one saving row", async () => {
    stubApi({
      quoteBody: quote({
        lines: [{ kind: "ticket", label: "Adult", quantity: 3, unit_amount: "5000", amount: "15000" }],
        subtotal: "15000",
        discount: "1500",
        total: "13500",
        savings: [{ kind: "group", label: "Group discount (10% off 3+ guests)", amount: "1500" }],
      }),
    });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel({ ...props, minSpots: 3 }));
    await waitFor(() => expect(result.current.quote).not.toBeNull());

    expect(result.current.card.headline).toMatchObject({ amount: "₦4,500", was: "₦5,000", pill: "Group discount", showFrom: false });
    expect(result.current.card.breakdown).toEqual([{ key: "saving-0", label: "Group saving", amount: "₦1,500" }]);
    expect(result.current.card.notes).toEqual([]);
  });

  it("lists add-ons above the total once there are some", async () => {
    stubApi({
      quoteBody: quote({
        lines: [
          { kind: "ticket", label: "Adult", quantity: 2, unit_amount: "5000", amount: "10000" },
          { kind: "addon", label: "GoPro footage", quantity: 1, unit_amount: "5000", amount: "5000" },
        ],
        subtotal: "15000",
        discount: "0",
        total: "15000",
      }),
    });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.quote).not.toBeNull());
    expect(result.current.card.breakdown.map((r) => [r.label, r.amount])).toEqual([["Adult × 2", "₦10,000"], ["GoPro footage", "₦5,000"]]);
  });

  it("says Free, and books for free, when the trip costs nothing", async () => {
    stubApi({
      quoteBody: quote({
        lines: [
          { kind: "ticket", label: "Adult", quantity: 2, unit_amount: "0", amount: "0" },
          { kind: "fee", label: "Payment processing fee", quantity: 1, unit_amount: "100", amount: "100" },
        ],
        subtotal: "0",
        discount: "0",
        total: "100",
      }),
    });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.quote).not.toBeNull());

    expect(result.current.card.total.amount).toBe("Free");
    expect(result.current.card.button.label).toBe("Book for free");
  });
});
