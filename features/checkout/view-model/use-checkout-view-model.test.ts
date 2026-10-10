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

const account = vi.hoisted(() => ({
  register: { mutateAsync: vi.fn(), reset: vi.fn(), error: null as unknown },
  google: { mutate: vi.fn() },
}));
vi.mock("../model/guest-account", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../model/guest-account")>()),
  useGuestRegister: () => account.register,
  useGuestGoogleSignup: () => account.google,
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

const signedIn = { user: { id: "u1", email: "juliet@example.com" }, hydrated: true };

// A writable stand-in for location, so the redirect can be read back.
async function withLocation(run: () => Promise<void>) {
  const original = window.location;
  const url = new URL(original.href);
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { href: url.href, origin: url.origin, protocol: url.protocol, host: url.host, hostname: url.hostname, port: url.port, pathname: url.pathname, search: url.search, hash: url.hash },
  });
  try {
    await run();
  } finally {
    Object.defineProperty(window, "location", { configurable: true, value: original });
  }
}

beforeEach(() => {
  session.value = { user: null, hydrated: true };
  account.register.mutateAsync.mockReset();
  account.register.reset.mockReset();
  account.register.error = null;
  account.google.mutate.mockReset();
  saveCheckoutDraft(draft);
  // The quote needs an account; most tests don't have one yet.
  server.use(http.post(apiUrl("/bookings/quote"), () => HttpResponse.json({}, { status: 401 })));
});
afterEach(() => {
  window.sessionStorage.clear();
  nav.push.mockReset();
  nav.replace.mockReset();
  toast.error.mockReset();
  toast.info.mockReset();
});

function fillDetails(result: { current: ReturnType<typeof useCheckoutViewModel> }) {
  act(() => result.current.form.onEmailChange(" juliet@example.com "));
  act(() => result.current.form.onPhoneChange("701 637-7711"));
}

describe("useCheckoutViewModel", () => {
  it("summarises the saved booking and starts at the details step for a guest", () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    expect(result.current.ready).toBe(true);
    expect(result.current.form.step).toBe("details");
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

  it("continues only with a valid email and phone, then asks for a password", () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    expect(result.current.form.canContinue).toBe(false);

    act(() => result.current.form.onEmailChange("not-an-email"));
    act(() => result.current.form.onPhoneChange("7016377711"));
    expect(result.current.form.canContinue).toBe(false);

    fillDetails(result);
    expect(result.current.form.phone).toBe("7016377711");
    expect(result.current.form.canContinue).toBe(true);
    act(() => result.current.form.onContinue());

    expect(result.current.form.step).toBe("password");
    expect(result.current.form.emailLocked).toBe(true);
    expect(result.current.form.phoneLocked).toBe(true);
  });

  it("won't continue on an invalid phone", () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.form.onEmailChange("juliet@example.com"));
    act(() => result.current.form.onPhoneChange("12345"));

    act(() => result.current.form.onContinue());

    expect(result.current.form.canContinue).toBe(false);
    expect(result.current.form.step).toBe("details");
  });

  it("checks the password rules and that both match before paying", () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    fillDetails(result);
    act(() => result.current.form.onContinue());
    expect(result.current.form.canPay).toBe(false);
    expect(result.current.form.passwordError).toBeNull();

    act(() => result.current.form.onPasswordChange("short1"));
    expect(result.current.form.passwordError).toMatch(/at least 8 characters/);
    act(() => result.current.form.onPasswordChange("onlyletters"));
    expect(result.current.form.passwordError).toMatch(/at least 8 characters/);

    act(() => result.current.form.onPasswordChange("longenough1"));
    expect(result.current.form.passwordError).toBeNull();
    act(() => result.current.form.onConfirmPasswordChange("different1"));
    expect(result.current.form.passwordError).toBe("The passwords don't match");
    expect(result.current.form.canPay).toBe(false);

    act(() => result.current.form.onConfirmPasswordChange("longenough1"));
    expect(result.current.form.canPay).toBe(true);
  });

  it("creates the account, then books, then goes to the payment page", async () => {
    const order: string[] = [];
    account.register.mutateAsync.mockImplementation(async () => {
      order.push("register");
    });
    let body: Record<string, unknown> | null = null;
    let key: string | null = null;
    server.use(
      http.post(apiUrl("/bookings/"), async ({ request }) => {
        order.push("book");
        body = (await request.json()) as Record<string, unknown>;
        key = request.headers.get("Idempotency-Key");
        return HttpResponse.json({ id: "b-1", status: "pending", payment_status: "unpaid", url: "https://pay.test/1" });
      }),
    );
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    fillDetails(result);
    act(() => result.current.form.onContinue());
    act(() => result.current.form.onPasswordChange("longenough1"));
    act(() => result.current.form.onConfirmPasswordChange("longenough1"));

    await withLocation(async () => {
      act(() => {
      void result.current.form.onConfirm();
    });
      await waitFor(() => expect(window.location.href).toBe("https://pay.test/1"));
    });

    expect(account.register.mutateAsync).toHaveBeenCalledWith({
      email: "juliet@example.com",
      password: "longenough1",
      phone_number: "+2347016377711",
    });
    expect(order).toEqual(["register", "book"]);
    expect(body).toMatchObject({ experience_id: "exp-1", guide_id: "g-1", items: [{ experience_price_id: "adult", quantity: 1 }] });
    expect(key).toBeTruthy();
    expect(window.sessionStorage.getItem("myjourny:checkout-draft")).toBeNull();
  });

  it("stays on the password step and doesn't book when sign-up fails", async () => {
    account.register.mutateAsync.mockRejectedValue(new Error("nope"));
    const created = vi.fn();
    server.use(http.post(apiUrl("/bookings/"), () => (created(), HttpResponse.json({}, { status: 201 }))));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    fillDetails(result);
    act(() => result.current.form.onContinue());
    act(() => result.current.form.onPasswordChange("longenough1"));
    act(() => result.current.form.onConfirmPasswordChange("longenough1"));

    act(() => {
      void result.current.form.onConfirm();
    });

    await waitFor(() => expect(result.current.form.pending).toBe(false));
    expect(result.current.form.step).toBe("password");
    expect(created).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("offers log in when the email already has an account", () => {
    account.register.error = { response: { data: { detail: "Email already registered" } } };
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    expect(result.current.form.emailTaken).toBe(true);
    expect(result.current.form.loginHref).toBe("/login?next=%2Fcheckout");
  });

  it("asks only for the phone once signed in, and books without signing up", async () => {
    session.value = signedIn;
    server.use(
      http.post(apiUrl("/bookings/"), () =>
        HttpResponse.json({ id: "b-1", status: "pending", payment_status: "unpaid", url: "https://pay.test/2" }),
      ),
    );
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    expect(result.current.form.step).toBe("pay");
    expect(result.current.form.email).toBe("juliet@example.com");
    expect(result.current.form.canPay).toBe(false);
    act(() => result.current.form.onPhoneChange("7016377711"));
    expect(result.current.form.canPay).toBe(true);

    await withLocation(async () => {
      act(() => {
      void result.current.form.onConfirm();
    });
      await waitFor(() => expect(window.location.href).toBe("https://pay.test/2"));
    });
    expect(account.register.mutateAsync).not.toHaveBeenCalled();
  });

  it("prices the booking for real once signed in", async () => {
    session.value = signedIn;
    server.use(
      http.post(apiUrl("/bookings/quote"), () =>
        HttpResponse.json({ currency: "NGN", lines: [], subtotal: "15000", discount: "0", checkout_fee: "0", total: "15000", guests: 1, days: 1, promo_applied: false }),
      ),
    );
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    await waitFor(() => expect(result.current.summary?.total).toBe("₦15,000.00"));
  });

  it("opens the booking's page without a checkout link, and the success page when it's free", async () => {
    session.value = signedIn;
    server.use(
      http.post(apiUrl("/bookings/"), () => HttpResponse.json({ id: "b-2", status: "confirmed", payment_status: "unpaid", url: null })),
    );
    const first = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => first.result.current.form.onPhoneChange("7016377711"));
    act(() => {
      void first.result.current.form.onConfirm();
    });
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/bookings/b-2/success"));

    saveCheckoutDraft(draft);
    server.use(
      http.post(apiUrl("/bookings/"), () => HttpResponse.json({ id: "b-3", status: "pending", payment_status: "unpaid", url: null })),
    );
    const second = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => second.result.current.form.onPhoneChange("7016377711"));
    act(() => {
      void second.result.current.form.onConfirm();
    });
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/bookings/b-3"));
  });

  it("shows why a booking couldn't start", async () => {
    session.value = signedIn;
    server.use(http.post(apiUrl("/bookings/"), () => HttpResponse.json({ detail: "This date is sold out" }, { status: 409 })));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.form.onPhoneChange("7016377711"));
    act(() => {
      void result.current.form.onConfirm();
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("This date is sold out"));
    expect(result.current.form.pending).toBe(false);
  });

  it("signs in with Google, and sends a two-factor account to log in", () => {
    account.google.mutate.mockImplementation((_payload, options) => options.onSuccess({ "2fa_required": true }));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    act(() => result.current.form.onGoogleCredential("cred"));

    expect(account.google.mutate).toHaveBeenCalledWith({ token: "cred" }, expect.any(Object));
    expect(nav.push).toHaveBeenCalledWith(expect.stringContaining("/login"));
    expect(result.current.form.googleLoading).toBe(false);
  });

  it("stops the Google spinner when sign-in fails or succeeds", () => {
    account.google.mutate.mockImplementation((_payload, options) => options.onError());
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.form.onGoogleCredential("cred"));
    expect(result.current.form.googleLoading).toBe(false);

    account.google.mutate.mockImplementation((_payload, options) => options.onSuccess({ access_token: "a" }));
    act(() => result.current.form.onGoogleCredential("cred"));
    expect(result.current.form.googleLoading).toBe(false);
    expect(nav.push).not.toHaveBeenCalled();
  });
});
