import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAuth, setAuth } from "@/lib/auth/session-store";
import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";
import { useGuideApplicationViewModel } from "./use-guide-application-view-model";

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

type Result = { current: ReturnType<typeof useGuideApplicationViewModel> };

/** Fills step 1 (with an account unless signed in) and continues. */
async function fillStep1(result: Result, account = true) {
  act(() => {
    result.current.setField("firstName", "Amara");
    result.current.setField("lastName", "Okafor");
    result.current.setField("dateOfBirth", "15/08/1995");
    result.current.setField("phoneNumber", "8012345678");
    if (account) {
      result.current.setField("email", "amara@example.com");
      result.current.setField("password", "Lagos2026!");
    }
  });
  await act(async () => {
    await result.current.handleContinue();
  });
}

const next = async (result: Result) => {
  await act(async () => {
    await result.current.handleContinue();
  });
};

const registers = () =>
  server.use(
    http.post(apiUrl("/auth/register/guide"), () => HttpResponse.json({ access_token: "a", refresh_token: "r", token_type: "bearer" }, { status: 201 })),
    http.get(apiUrl("/auth/me"), () => HttpResponse.json({ id: "u1", email: "amara@example.com", signup_type: "guide" })),
  );

describe("useGuideApplicationViewModel", () => {
  beforeEach(() => {
    server.use(http.post(apiUrl("/auth/email-exists"), () => HttpResponse.json({ exists: false, has_password: false })));
  });

  afterEach(() => {
    clearAuth();
    window.sessionStorage.clear();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("starts on step 1 as an individual, with the password rules unticked", () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    expect(result.current.step).toBe(1);
    expect(result.current.formData.verificationType).toBe("individual");
    expect(result.current.passwordRules.every((r) => !r.met)).toBe(true);
    expect(result.current.showPasswordErrors).toBe(false);
  });

  it("says what's missing on step 1, account details included, and stays put", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await next(result);
    expect(result.current.step).toBe(1);
    expect(result.current.errors).toMatchObject({
      firstName: "Enter your first name",
      lastName: "Enter your last name",
      dateOfBirth: "Enter your date of birth",
      phoneNumber: "Enter your phone number",
      email: "Enter your email address",
      password: "Create a password",
    });
    expect(result.current.showPasswordErrors).toBe(true);
  });

  it("refuses a date that isn't real, anyone under 18, a short phone number, a bad email and a weak password", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    act(() => {
      result.current.setField("firstName", "Samuel");
      result.current.setField("lastName", "Samuels");
      result.current.setField("dateOfBirth", "31/02/1995");
      result.current.setField("phoneNumber", "801");
      result.current.setField("email", "samuel@");
      result.current.setField("password", "password");
    });
    await next(result);
    expect(result.current.errors).toMatchObject({
      dateOfBirth: "Enter your date of birth as DD/MM/YYYY",
      phoneNumber: "Enter a valid phone number",
      email: "Enter a valid email address, like name@example.com",
      password: "Your password needs to meet all the rules below",
    });

    act(() => result.current.setField("dateOfBirth", `01/01/${new Date().getFullYear() - 17}`));
    await next(result);
    expect(result.current.errors.dateOfBirth).toBe("You need to be at least 18 to host on MyJourny");
  });

  it("ticks password rules as they're met, and clears a field's mistake once it changes", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await next(result);
    act(() => result.current.setField("password", "Lagos2026!"));
    expect(result.current.passwordRules.every((r) => r.met)).toBe(true);
    expect(result.current.errors.password).toBeUndefined();
  });

  it("moves to step 2 once step 1 is right, and back again", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await fillStep1(result);
    expect(result.current.step).toBe(2);
    expect(result.current.applyingEmail).toBe("amara@example.com");
    act(() => result.current.handleBack());
    expect(result.current.step).toBe(1);
  });

  it("stops on step 1 and offers to log in when the email already has an account", async () => {
    server.use(http.post(apiUrl("/auth/email-exists"), () => HttpResponse.json({ exists: true, has_password: true })));
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await fillStep1(result);
    expect(result.current.step).toBe(1);
    expect(result.current.accountExists).toBe(true);

    // Changing the email takes the message away.
    act(() => result.current.setField("email", "new@example.com"));
    expect(result.current.accountExists).toBe(false);

    act(() => result.current.handleLogIn());
    expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fbecome-a-guide%2Fapply");
  });

  it("carries on when the email lookup fails", async () => {
    server.use(http.post(apiUrl("/auth/email-exists"), () => HttpResponse.json({}, { status: 429 })));
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await fillStep1(result);
    expect(result.current.step).toBe(2);
  });

  it("shows and hides the password", () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    expect(result.current.showPassword).toBe(false);
    act(() => result.current.onTogglePassword());
    expect(result.current.showPassword).toBe(true);
  });

  it("asks a business for its brand name and a real CAC number; an individual's brand is optional", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await fillStep1(result);
    await next(result);
    expect(result.current.errors).toEqual({ country: "Choose where you're registered" });

    act(() => {
      result.current.setVerificationType("business");
      result.current.setField("country", "Nigeria");
      result.current.setField("website", "samuel");
      result.current.setField("cacNumber", "12345");
    });
    await next(result);
    expect(result.current.errors).toEqual({
      businessName: "Enter your company's brand name",
      cacNumber: "Enter an RC or BN number, like RC1234566",
      website: "Enter a web address, like samuel.com",
    });

    // Back to individual: the business-only mistakes go.
    act(() => result.current.setVerificationType("individual"));
    expect(result.current.errors).toEqual({ website: "Enter a web address, like samuel.com" });
  });

  it("submits and moves to review", async () => {
    registers();
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await fillStep1(result);
    act(() => result.current.setField("country", "Nigeria"));
    await next(result);
    expect(result.current.step).toBe("review");
  });

  it("stays on step 2 when registration fails", async () => {
    server.use(http.post(apiUrl("/auth/register/guide"), () => HttpResponse.json({ detail: "Registration failed" }, { status: 400 })));
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await fillStep1(result);
    act(() => result.current.setField("country", "Nigeria"));
    await next(result);
    expect(result.current.step).toBe(2);
  });

  it("takes the new host to their dashboard when they're done", () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    act(() => result.current.handleDone());
    expect(mockPush).toHaveBeenCalledWith("/host/dashboard");
  });

  it("offers to log in when the email already has an account, keeping the form but not the password", async () => {
    server.use(
      http.post(apiUrl("/auth/register/guide"), () => HttpResponse.json({ detail: "This email is already registered with MyJourny." }, { status: 409 })),
    );
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await fillStep1(result);
    act(() => result.current.setField("country", "Nigeria"));
    await next(result);
    expect(result.current.step).toBe(2);
    expect(result.current.accountExists).toBe(true);

    act(() => result.current.handleLogIn());
    expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fbecome-a-guide%2Fapply");
    const draft = JSON.parse(window.sessionStorage.getItem("myjourny:guide-application-draft")!);
    expect(draft).toMatchObject({ firstName: "Amara", lastName: "Okafor", country: "Nigeria", password: "" });

    const back = renderHookWithProviders(() => useGuideApplicationViewModel());
    await waitFor(() => expect(back.result.current.step).toBe(2));
    expect(back.result.current.formData.firstName).toBe("Amara");
  });

  describe("signed in as a traveller", () => {
    it("starts with the account's name, asks for no email or password, and adds hosting to the account", async () => {
      const sent: { body: unknown } = { body: null };
      server.use(
        http.get(apiUrl("/auth/me"), () =>
          HttpResponse.json({ id: "u1", email: "amara@example.com", full_name: "Amara Okafor", signup_type: "traveller", is_host: false }),
        ),
        http.post(apiUrl("/auth/me/host"), async ({ request }) => {
          sent.body = await request.json();
          return HttpResponse.json({ id: "u1", email: "amara@example.com", signup_type: "both", guide_status: "pending", is_host: true }, { status: 201 });
        }),
      );
      setAuth({ access_token: "a", refresh_token: "r" }, { id: "u1", email: "amara@example.com", fullName: "Amara Grace Okafor", avatarUrl: null });
      const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());

      await waitFor(() => expect(result.current.signedInEmail).toBe("amara@example.com"));
      expect(result.current.formData).toMatchObject({ firstName: "Amara", lastName: "Grace Okafor" });
      expect(result.current.applyingEmail).toBe("amara@example.com");

      // Changing one name keeps the other from the account.
      act(() => result.current.setField("firstName", "Ama"));
      expect(result.current.formData).toMatchObject({ firstName: "Ama", lastName: "Grace Okafor" });

      act(() => {
        result.current.setField("dateOfBirth", "15/08/1995");
        result.current.setField("phoneNumber", "8012345678");
      });
      await next(result);
      expect(result.current.step).toBe(2);
      act(() => result.current.setField("country", "Nigeria"));
      await next(result);

      expect(result.current.step).toBe("review");
      expect(sent.body).not.toHaveProperty("email");
      expect(sent.body).not.toHaveProperty("password");
      expect(sent.body).toMatchObject({ full_name: "Ama Grace Okafor" });
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("sends someone who already hosts to the host dashboard", async () => {
      server.use(http.get(apiUrl("/auth/me"), () => HttpResponse.json({ id: "u1", email: "amara@example.com", signup_type: "both", is_host: true })));
      setAuth({ access_token: "a", refresh_token: "r" }, { id: "u1", email: "amara@example.com", fullName: null, avatarUrl: null });
      renderHookWithProviders(() => useGuideApplicationViewModel());
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/host/dashboard"));
    });
  });
});
