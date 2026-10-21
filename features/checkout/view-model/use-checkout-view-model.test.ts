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
const toast = vi.hoisted(() => ({ error: vi.fn() }));
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
  lookup: { mutateAsync: vi.fn(), isPending: false },
  register: { mutateAsync: vi.fn() },
  google: { mutateAsync: vi.fn() },
  login: { mutateAsync: vi.fn() },
}));
vi.mock("../model/guest-account", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../model/guest-account")>()),
  useEmailLookup: () => account.lookup,
  useGuestRegister: () => account.register,
  useGuestGoogleSignup: () => account.google,
  useGuestLogin: () => account.login,
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

const juliet = { user: { id: "u1", email: "juliet@example.com" }, hydrated: true };
const tokens = { access_token: "a", refresh_token: "r", token_type: "bearer" };
const twoFactor = { "2fa_required": true };

// Signing in fills the session, as the real auth hooks do.
const signsIn = (data: unknown = tokens) =>
  vi.fn(async () => {
    if (!(data as Record<string, unknown>)["2fa_required"]) session.value = juliet;
    return data;
  });

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

type Result = { current: ReturnType<typeof useCheckoutViewModel> };

async function enterEmail(result: Result, email = " juliet@example.com ") {
  act(() => result.current.steps.onStartAuth());
  act(() => result.current.auth.onEmailChange(email));
  await act(async () => result.current.auth.onContinue());
}

beforeEach(() => {
  session.value = { user: null, hydrated: true };
  account.lookup.mutateAsync = vi.fn(async () => ({ exists: false, hasPassword: false }));
  account.lookup.isPending = false;
  account.register.mutateAsync = signsIn();
  account.google.mutateAsync = signsIn();
  account.login.mutateAsync = signsIn();
  saveCheckoutDraft(draft);
  server.use(
    http.post(apiUrl("/bookings/quote"), () =>
      HttpResponse.json({ currency: "NGN", lines: [], subtotal: "15000", discount: "0", checkout_fee: "0", total: "15000", guests: 1, days: 1, promo_applied: false }),
    ),
  );
});
afterEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe("useCheckoutViewModel: the page", () => {
  it("summarises the saved booking and starts a guest at step 1", () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    expect(result.current.ready).toBe(true);
    expect(result.current.summary).toMatchObject({
      title: "Lagos Food Walk",
      when: "Tuesday, September 12 at 7:30 AM",
      guests: "1 guest",
      total: "₦16,000.00",
      quantity: "x 1 Adult",
      changeHref: "/experiences/exp-1",
    });
    expect(result.current.steps.account).toBeNull();
    expect(result.current.steps.canPay).toBe(false);
    expect(result.current.steps.backHref).toBe("/experiences/exp-1");
    expect(result.current.auth.open).toBe(false);
  });

  it("sends them home when there is no saved booking", () => {
    window.localStorage.clear();
    renderHookWithProviders(() => useCheckoutViewModel());
    expect(nav.replace).toHaveBeenCalledWith("/");
  });

  it("shows a signed-in person as logged in, prices for real and lets them pay", async () => {
    session.value = juliet;
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    expect(result.current.steps.account).toBe("juliet@example.com");
    expect(result.current.steps.canPay).toBe(true);
    await waitFor(() => expect(result.current.summary?.total).toBe("₦15,000.00"));
    expect(result.current.steps.free).toBe(false);
  });

  it("calls a booking that costs nothing Free, with nothing to pay", async () => {
    session.value = juliet;
    server.use(
      http.post(apiUrl("/bookings/quote"), () =>
        HttpResponse.json({ currency: "NGN", lines: [], subtotal: "0", discount: "0", checkout_fee: "0", total: "0", guests: 1, days: 1, promo_applied: false }),
      ),
    );
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    await waitFor(() => expect(result.current.summary?.total).toBe("Free"));
    expect(result.current.steps.free).toBe(true);
  });
});

describe("useCheckoutViewModel: log in or sign up", () => {
  it("continues only with a valid email", async () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.steps.onStartAuth());
    expect(result.current.auth.open).toBe(true);

    act(() => result.current.auth.onEmailChange("not-an-email"));
    expect(result.current.auth.canContinue).toBe(false);
    await act(async () => result.current.auth.onContinue());
    expect(account.lookup.mutateAsync).not.toHaveBeenCalled();

    act(() => result.current.auth.onEmailChange("juliet@example.com"));
    expect(result.current.auth.canContinue).toBe(true);
  });

  it("asks a new email to create a password, checks it, then signs up and closes", async () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await enterEmail(result);
    expect(account.lookup.mutateAsync).toHaveBeenCalledWith("juliet@example.com");
    expect(result.current.auth.stage).toBe("signup");

    act(() => result.current.auth.onPasswordChange("short"));
    expect(result.current.auth.passwordError).toBe(
      "Your password should contain at least 8 characters, a letter and a number",
    );
    act(() => result.current.auth.onPasswordChange("longenough1"));
    act(() => result.current.auth.onConfirmPasswordChange("longenough2"));
    expect(result.current.auth.passwordError).toBe("The passwords don't match");
    expect(result.current.auth.canSubmit).toBe(false);

    act(() => result.current.auth.onConfirmPasswordChange("longenough1"));
    expect(result.current.auth.canSubmit).toBe(true);
    await act(async () => result.current.auth.onSubmit());

    expect(account.register.mutateAsync).toHaveBeenCalledWith({ email: "juliet@example.com", password: "longenough1" });
    expect(result.current.auth.open).toBe(false);
    expect(result.current.steps.account).toBe("juliet@example.com");
    expect(result.current.steps.canPay).toBe(true);
  });

  it("treats the email as new when the lookup fails", async () => {
    account.lookup.mutateAsync = vi.fn(async () => null);
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await enterEmail(result);
    expect(result.current.auth.stage).toBe("signup");
  });

  it("moves to log in when sign-up says the email is taken after all", async () => {
    account.register.mutateAsync = vi.fn(async () => {
      throw { response: { data: { detail: "Email already registered" } } };
    });
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await enterEmail(result);
    act(() => result.current.auth.onPasswordChange("longenough1"));
    act(() => result.current.auth.onConfirmPasswordChange("longenough1"));
    await act(async () => result.current.auth.onSubmit());

    expect(result.current.auth.stage).toBe("login");
    expect(result.current.auth.password).toBe("");
    expect(result.current.steps.account).toBeNull();
  });

  it("asks an existing email for its password and logs in", async () => {
    account.lookup.mutateAsync = vi.fn(async () => ({ exists: true, hasPassword: true }));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await enterEmail(result);
    expect(result.current.auth.stage).toBe("login");
    expect(result.current.auth.canSubmit).toBe(false);

    act(() => result.current.auth.onPasswordChange("secret123"));
    await act(async () => result.current.auth.onSubmit());

    expect(account.login.mutateAsync).toHaveBeenCalledWith({ email: "juliet@example.com", password: "secret123" });
    expect(result.current.auth.open).toBe(false);
    expect(result.current.steps.account).toBe("juliet@example.com");
  });

  it("stays on the password step when the login fails", async () => {
    account.lookup.mutateAsync = vi.fn(async () => ({ exists: true, hasPassword: true }));
    account.login.mutateAsync = vi.fn(async () => {
      throw new Error("Incorrect email or password");
    });
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await enterEmail(result);
    act(() => result.current.auth.onPasswordChange("wrong"));
    await act(async () => result.current.auth.onSubmit());

    expect(result.current.auth.stage).toBe("login");
    expect(result.current.auth.open).toBe(true);
    expect(result.current.auth.pending).toBe(false);
  });

  it("asks for the two-factor code after the password, then logs in with it", async () => {
    account.lookup.mutateAsync = vi.fn(async () => ({ exists: true, hasPassword: true }));
    account.login.mutateAsync = vi.fn(async (payload: { code?: string }) => {
      if (!payload.code) return twoFactor;
      session.value = juliet;
      return tokens;
    });
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await enterEmail(result);
    act(() => result.current.auth.onPasswordChange("secret123"));
    await act(async () => result.current.auth.onSubmit());
    expect(result.current.auth.stage).toBe("code");

    act(() => result.current.auth.onCodeChange(" 123456 "));
    await act(async () => result.current.auth.onSubmit());

    expect(account.login.mutateAsync).toHaveBeenLastCalledWith({
      email: "juliet@example.com",
      password: "secret123",
      code: "123456",
    });
    expect(result.current.steps.account).toBe("juliet@example.com");
  });

  it("points a Google-only account to Google", async () => {
    account.lookup.mutateAsync = vi.fn(async () => ({ exists: true, hasPassword: false }));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await enterEmail(result);
    expect(result.current.auth.stage).toBe("google");

    await act(async () => result.current.auth.onGoogleCredential("google-token"));
    expect(account.google.mutateAsync).toHaveBeenCalledWith({ token: "google-token" });
    expect(result.current.steps.account).toBe("juliet@example.com");
  });

  it("signs in with Google, asking for a code when the account has two-factor sign-in", async () => {
    account.google.mutateAsync = vi.fn(async (payload: { code?: string }) => {
      if (!payload.code) return twoFactor;
      session.value = juliet;
      return tokens;
    });
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.steps.onStartAuth());
    await act(async () => result.current.auth.onGoogleCredential("google-token"));
    expect(result.current.auth.stage).toBe("code");
    expect(result.current.auth.googleLoading).toBe(false);

    act(() => result.current.auth.onCodeChange("123456"));
    await act(async () => result.current.auth.onSubmit());
    expect(account.google.mutateAsync).toHaveBeenLastCalledWith({ token: "google-token", code: "123456" });
    expect(result.current.steps.account).toBe("juliet@example.com");
  });

  it("goes back to the email, and forgets what was typed, from a later step or on close", async () => {
    account.lookup.mutateAsync = vi.fn(async () => ({ exists: true, hasPassword: true }));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await enterEmail(result);
    act(() => result.current.auth.onPasswordChange("secret123"));

    act(() => result.current.auth.onBack());
    expect(result.current.auth.stage).toBe("email");
    expect(result.current.auth.password).toBe("");
    expect(result.current.auth.email).toBe(" juliet@example.com ");

    await act(async () => result.current.auth.onContinue());
    act(() => result.current.auth.onOpenChange(false));
    expect(result.current.auth.open).toBe(false);
    expect(result.current.auth.stage).toBe("email");
  });

  it.each([
    ["closed", (result: Result) => result.current.auth.onOpenChange(false)],
    ["went back", (result: Result) => result.current.auth.onBack()],
    ["changed the email", (result: Result) => result.current.auth.onEmailChange("other@example.com")],
  ])("ignores an email check that answers after they %s", async (_, interrupt) => {
    let answer!: (value: unknown) => void;
    account.lookup.mutateAsync = vi.fn(() => new Promise((resolve) => (answer = resolve)));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    act(() => result.current.steps.onStartAuth());
    act(() => result.current.auth.onEmailChange("juliet@example.com"));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.auth.onContinue();
    });

    act(() => interrupt(result));
    await act(async () => {
      answer({ exists: true, hasPassword: true });
      await pending;
    });

    expect(result.current.auth.stage).toBe("email");
  });

  it("notes the way back to checkout when they go to reset a password", async () => {
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    expect(result.current.auth.forgotHref).toBe("/login/forgot-password");
    act(() => result.current.auth.onForgotPassword());
    expect(window.localStorage.getItem("myjourny:checkout-draft")).not.toBeNull();
  });
});

describe("useCheckoutViewModel: confirm and pay", () => {
  it("books once logged in and goes to the payment page", async () => {
    session.value = juliet;
    let body: Record<string, unknown> | null = null;
    let key: string | null = null;
    server.use(
      http.post(apiUrl("/bookings/"), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        key = request.headers.get("Idempotency-Key");
        return HttpResponse.json({ id: "b-1", status: "pending", payment_status: "unpaid", url: "https://pay.test/1" });
      }),
    );
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());

    await withLocation(async () => {
      act(() => {
        void result.current.steps.onConfirm();
      });
      expect(result.current.steps.paying).toBe(true);
      await waitFor(() => expect(window.location.href).toBe("https://pay.test/1"));
    });

    expect(body).toMatchObject({ experience_id: "exp-1", guide_id: "g-1", items: [{ experience_price_id: "adult", quantity: 1 }] });
    expect(key).toBeTruthy();
    expect(window.localStorage.getItem("myjourny:checkout-draft")).toBeNull();
  });

  it("won't book before they're logged in", async () => {
    const booked = vi.fn();
    server.use(http.post(apiUrl("/bookings/"), () => (booked(), HttpResponse.json({}))));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await act(async () => result.current.steps.onConfirm());
    expect(booked).not.toHaveBeenCalled();
  });

  it("opens the success page for a free booking, and the booking's page without a payment link", async () => {
    session.value = juliet;
    server.use(
      http.post(apiUrl("/bookings/"), () => HttpResponse.json({ id: "b-2", status: "confirmed", payment_status: "unpaid", url: null })),
    );
    const first = renderHookWithProviders(() => useCheckoutViewModel());
    await act(async () => first.result.current.steps.onConfirm());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/bookings/b-2/success"));

    saveCheckoutDraft(draft);
    server.use(
      http.post(apiUrl("/bookings/"), () => HttpResponse.json({ id: "b-3", status: "pending", payment_status: "unpaid", url: null })),
    );
    const second = renderHookWithProviders(() => useCheckoutViewModel());
    await act(async () => second.result.current.steps.onConfirm());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/bookings/b-3"));
  });

  it("shows why a booking couldn't start and lets them try again", async () => {
    session.value = juliet;
    server.use(http.post(apiUrl("/bookings/"), () => HttpResponse.json({ detail: "Nope" }, { status: 400 })));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await act(async () => result.current.steps.onConfirm());

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Nope"));
    expect(result.current.steps.paying).toBe(false);
    expect(result.current.steps.canPay).toBe(true);
  });

  it("sends them back to the experience to pick again when the session filled up", async () => {
    session.value = juliet;
    server.use(http.post(apiUrl("/bookings/"), () => HttpResponse.json({ detail: "This date is sold out" }, { status: 409 })));
    const { result } = renderHookWithProviders(() => useCheckoutViewModel());
    await act(async () => result.current.steps.onConfirm());

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("This date is sold out"));
    expect(nav.push).toHaveBeenCalledWith("/experiences/exp-1");
  });
});
