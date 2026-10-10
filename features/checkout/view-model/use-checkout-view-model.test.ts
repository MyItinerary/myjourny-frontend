import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { type CheckoutDraft, saveCheckoutDraft } from "../model/checkout-draft";
import { useCheckoutViewModel } from "./use-checkout-view-model";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => nav }));
const toast = vi.hoisted(() => ({ error: vi.fn(), info: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const session = vi.hoisted(() => ({
  value: { user: null as { id: string; email: string | null } | null, hydrated: true },
}));
vi.mock("@/lib/auth/session-store", () => ({
  useSession: () => session.value,
  getTokens: () => ({ accessToken: null, refreshToken: null }),
  clearAuth: vi.fn(),
  setTokens: vi.fn(),
  setAuth: vi.fn(),
  setUser: vi.fn(),
}));

const signup = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
const google = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("../model/guest-signup", () => ({
  useGuestEmailSignup: () => signup,
  useGuestGoogleSignup: () => google,
}));

const draft: CheckoutDraft = {
  experienceId: "exp-1",
  guideId: "g-1",
  selection: { experience_id: "exp-1", items: [{ experience_price_id: "adult", quantity: 1 }], addons: [] },
  title: "Lagos Food Walk",
  imageUrl: null,
  rating: 4.5,
  when: "Tuesday, September 12 at 7:30 AM",
  guests: 1,
  ticketsLabel: "1 Adult",
  total: "₦16,000.00",
  currency: "NGN",
  durationLabel: "2.5 hours",
};

beforeEach(() => {
  session.value = { user: null, hydrated: true };
  signup.mutate.mockReset();
  signup.isPending = false;
  saveCheckoutDraft(draft);
});
afterEach(() => {
  window.sessionStorage.clear();
  nav.push.mockReset();
  nav.replace.mockReset();
  toast.error.mockReset();
  toast.info.mockReset();
});

describe("useCheckoutViewModel", () => {
  it("summarises the saved booking and starts at the email step for a guest", () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    expect(result.current.ready).toBe(true);
    expect(result.current.step).toBe("email");
    expect(result.current.summary).toMatchObject({
      title: "Lagos Food Walk",
      guests: "1 guest",
      total: "₦16,000.00",
      quantity: "x 1 Adult",
      changeHref: "/experiences/exp-1",
    });
  });

  it("sends the guest home when there is no saved booking", () => {
    window.sessionStorage.clear();
    renderHookWithProviders(() => useCheckoutViewModel());
    expect(nav.replace).toHaveBeenCalledWith("/");
  });

  it("only continues with a valid email, then signs the guest up with it", () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    expect(result.current.email.canContinue).toBe(false);

    act(() => result.current.email.onChange("not-an-email"));
    expect(result.current.email.canContinue).toBe(false);

    act(() => result.current.email.onChange(" juliet@example.com "));
    expect(result.current.email.canContinue).toBe(true);
    act(() => result.current.email.onContinue());

    expect(signup.mutate).toHaveBeenCalledWith("juliet@example.com", expect.any(Object));
  });

  it("explains when the email can't be used", () => {
    signup.mutate.mockImplementation((_email, options) => options.onError(new Error("nope")));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.email.onChange("juliet@example.com"));
    act(() => result.current.email.onContinue());

    expect(toast.error).toHaveBeenCalled();
  });

  it("moves to the details step once the guest has an account", () => {
    session.value = { user: { id: "u1", email: "juliet@example.com" }, hydrated: true };
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    expect(result.current.step).toBe("details");
    expect(result.current.details.email).toBe("juliet@example.com");
  });

  it("signs in with Google, and sends a two-factor account to log in", () => {
    google.mutate.mockImplementation((_payload, options) => options.onSuccess({ "2fa_required": true }));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    act(() => result.current.email.onGoogleCredential("cred"));

    expect(google.mutate).toHaveBeenCalledWith({ token: "cred" }, expect.any(Object));
    expect(nav.push).toHaveBeenCalledWith(expect.stringContaining("/login"));
    expect(result.current.email.googleLoading).toBe(false);
  });

  it("stops the Google spinner when sign-in fails", () => {
    google.mutate.mockImplementation((_payload, options) => options.onError());
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.email.onGoogleCredential("cred"));
    expect(result.current.email.googleLoading).toBe(false);
  });

  it("prices the booking for real once signed in", async () => {
    session.value = { user: { id: "u1", email: "juliet@example.com" }, hydrated: true };
    server.use(
      http.post(apiUrl("/bookings/quote"), () =>
        HttpResponse.json({
          currency: "NGN",
          lines: [],
          subtotal: "15000",
          discount: "0",
          checkout_fee: "0",
          total: "15000",
          guests: 1,
          days: 1,
          promo_applied: false,
        }),
      ),
    );
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    await waitFor(() => expect(result.current.summary?.total).toBe("₦15,000.00"));
  });

  it("needs a valid phone number before paying, and keeps digits only", () => {
    session.value = { user: { id: "u1", email: "juliet@example.com" }, hydrated: true };
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    expect(result.current.details.canPay).toBe(false);

    act(() => result.current.details.onPhoneChange("701 637-7711"));
    expect(result.current.details.phone).toBe("7016377711");
    expect(result.current.details.canPay).toBe(true);

    act(() => result.current.details.onPhoneChange("12345"));
    expect(result.current.details.canPay).toBe(false);
  });

  it("books and goes to the payment page", async () => {
    session.value = { user: { id: "u1", email: "juliet@example.com" }, hydrated: true };
    let body: Record<string, unknown> | null = null;
    let key: string | null = null;
    server.use(
      http.post(apiUrl("/bookings/quote"), () => HttpResponse.json({}, { status: 400 })),
      http.post(apiUrl("/bookings/"), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        key = request.headers.get("Idempotency-Key");
        return HttpResponse.json({ id: "b-1", status: "pending", payment_status: "unpaid", url: "https://pay.test/1" });
      }),
    );
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.details.onPhoneChange("7016377711"));

    const original = window.location;
    const url = new URL(original.href);
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: url.href, origin: url.origin, protocol: url.protocol, host: url.host, hostname: url.hostname, port: url.port, pathname: url.pathname, search: url.search, hash: url.hash },
    });
    try {
      act(() => result.current.details.onConfirm());
      await waitFor(() => expect(window.location.href).toBe("https://pay.test/1"));
    } finally {
      Object.defineProperty(window, "location", { configurable: true, value: original });
    }

    expect(body).toMatchObject({ experience_id: "exp-1", guide_id: "g-1", items: [{ experience_price_id: "adult", quantity: 1 }] });
    expect(key).toBeTruthy();
    expect(window.sessionStorage.getItem("myjourny:checkout-draft")).toBeNull();
  });

  it("opens the booking's page when there's no checkout link, and the success page when it's free", async () => {
    session.value = { user: { id: "u1", email: "juliet@example.com" }, hydrated: true };
    server.use(
      http.post(apiUrl("/bookings/quote"), () => HttpResponse.json({}, { status: 400 })),
      http.post(apiUrl("/bookings/"), () => HttpResponse.json({ id: "b-2", status: "confirmed", payment_status: "unpaid", url: null })),
    );
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.details.onPhoneChange("7016377711"));
    act(() => result.current.details.onConfirm());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/bookings/b-2/success"));

    saveCheckoutDraft(draft);
    server.use(
      http.post(apiUrl("/bookings/"), () => HttpResponse.json({ id: "b-3", status: "pending", payment_status: "unpaid", url: null })),
    );
    const second = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => second.result.current.details.onPhoneChange("7016377711"));
    act(() => second.result.current.details.onConfirm());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/bookings/b-3"));
  });

  it("shows why a booking couldn't start", async () => {
    session.value = { user: { id: "u1", email: "juliet@example.com" }, hydrated: true };
    server.use(
      http.post(apiUrl("/bookings/quote"), () => HttpResponse.json({}, { status: 400 })),
      http.post(apiUrl("/bookings/"), () => HttpResponse.json({ detail: "This date is sold out" }, { status: 409 })),
    );
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.details.onPhoneChange("7016377711"));
    act(() => result.current.details.onConfirm());

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("This date is sold out"));
  });
});
