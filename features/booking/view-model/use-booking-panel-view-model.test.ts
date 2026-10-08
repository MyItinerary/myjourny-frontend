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
          ? [{ starts_at: startsAt, local_date: soon, local_time: "09:00:00", seats_left: seatsLeft, sold_out: false }]
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
    expect(result.current.quote!.lines.map((l) => [l.label, l.isDiscount])).toEqual([
      ["Adult × 2", false],
      ["SAVE10", true],
    ]);
    expect(result.current.total).toBe("₦9,000.00");
    expect(result.current.booking).toMatchObject({ available: true, disabled: false, label: "Book now - ₦9,000.00" });
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
    stubApi({ seatsLeft: 1, quoteBody: quote({ guests: 2 }) });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.quote).not.toBeNull());

    expect(result.current.seatsWarning).toBe("Only 1 spot left for this session.");
    expect(result.current.tickets[0].max).toBe(1);
    expect(result.current.booking.disabled).toBe(true);
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

  it("opens the booking's page when it awaits payment without a link", async () => {
    stubApi();
    server.use(
      http.post(apiUrl("/bookings/"), () =>
        HttpResponse.json({ id: "b-3", status: "pending", payment_status: "unpaid", url: null }),
      ),
    );
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));
    await waitFor(() => expect(result.current.booking.disabled).toBe(false));

    act(() => result.current.booking.onBook());

    await waitFor(() => expect(push).toHaveBeenCalledWith("/bookings/b-3"));
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

  it("can't be booked without a guide", async () => {
    stubApi();
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel({ ...props, guideId: null }));
    await waitFor(() => expect(result.current.quote).not.toBeNull());
    act(() => result.current.booking.onBook());
    expect(result.current.booking.available).toBe(false);
  });

  it("books an unscheduled experience by date and lets the server set the time", async () => {
    const quotes = stubApi({ scheduled: false });
    const { result } = renderHookWithProviders(() => useBookingPanelViewModel(props));

    await waitFor(() => expect(quotes.length).toBeGreaterThan(0));
    expect(quotes[0]).toHaveProperty("requested_date");
    expect(quotes[0]).not.toHaveProperty("requested_datetime");
    expect(result.current.lengthNote).toBeNull();
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
    const { result } = renderHookWithProviders(() =>
      useBookingPanelViewModel({
        ...props,
        schedule: { schedule_type: "recurring", recurrence_type: "weekly", recurrence_days: ["sat"], length_days: 3 },
      }),
    );

    await waitFor(() => expect(result.current.quote?.when).toBe("Sat, June 1 at 9:00 AM – Mon, June 3"));
    expect(quotes[0]).not.toHaveProperty("days");
    expect(result.current.days.show).toBe(false);
    expect(result.current.lengthNote).toBe("Each booking covers all 3 days.");
    expect(result.current.scheduleLabel).toBe("Every Saturday · 3 days");
  });
});

