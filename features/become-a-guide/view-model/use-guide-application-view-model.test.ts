import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

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

async function fillStep1(result: { current: ReturnType<typeof useGuideApplicationViewModel> }) {
  act(() => {
    result.current.setField("fullName", "Amara Okafor");
    result.current.setField("dateOfBirth", "15/08/1995");
    result.current.setField("phoneNumber", "8012345678");
  });
  await act(async () => {
    await result.current.handleContinue();
  });
}

describe("useGuideApplicationViewModel", () => {
  afterEach(() => {
    clearAuth();
    window.sessionStorage.clear();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("initializes on step 1 with default values", () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());

    expect(result.current.step).toBe(1);
    expect(result.current.formData.city).toBe("Lagos");
    expect(result.current.formData.verificationType).toBe("individual");
  });

  it("blocks transition to step 2 when required step 1 fields are empty", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());

    await act(async () => {
      await result.current.handleContinue();
    });

    expect(result.current.step).toBe(1);
    expect(result.current.errors.fullName).toBeDefined();
    expect(result.current.errors.dateOfBirth).toBeDefined();
    expect(result.current.errors.phoneNumber).toBeDefined();
  });

  it("refuses a date that isn't real, an applicant under 18 and a phone number that's too short", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    const today = new Date();
    const seventeen = `01/01/${today.getFullYear() - 17}`;

    act(() => {
      result.current.setField("fullName", "Samuel Samuels");
      result.current.setField("dateOfBirth", "31/02/1995");
      result.current.setField("phoneNumber", "801");
    });
    await act(async () => {
      await result.current.handleContinue();
    });
    expect(result.current.step).toBe(1);
    expect(result.current.errors.dateOfBirth).toBe("Enter your date of birth as DD/MM/YYYY");
    expect(result.current.errors.phoneNumber).toBe("Please enter a valid phone number");

    act(() => result.current.setField("dateOfBirth", seventeen));
    await act(async () => {
      await result.current.handleContinue();
    });
    expect(result.current.errors.dateOfBirth).toBe("You need to be at least 18 to guide on Myjourny");
  });

  it("refuses an email address without a domain on step 2", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());

    act(() => {
      result.current.setField("fullName", "Samuel Samuels");
      result.current.setField("dateOfBirth", "15/08/1995");
      result.current.setField("phoneNumber", "8012345678");
    });
    await act(async () => {
      await result.current.handleContinue();
    });
    act(() => {
      result.current.setField("email", "samuel@");
      result.current.setField("password", "strongpassword123");
    });
    await act(async () => {
      await result.current.handleContinue();
    });

    expect(result.current.step).toBe(2);
    expect(result.current.errors.email).toBe("Please enter a valid email address");
  });

  it("transitions to step 2 when step 1 is valid", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());

    act(() => {
      result.current.setField("fullName", "Samuel Samuels");
      result.current.setField("dateOfBirth", "15/08/1995");
      result.current.setField("phoneNumber", "8012345678");
    });

    await act(async () => {
      await result.current.handleContinue();
    });

    expect(result.current.step).toBe(2);
  });

  it("navigates back to step 1 from step 2", async () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());

    act(() => {
      result.current.setField("fullName", "Samuel Samuels");
      result.current.setField("dateOfBirth", "15/08/1995");
      result.current.setField("phoneNumber", "8012345678");
    });

    await act(async () => {
      await result.current.handleContinue();
    });
    expect(result.current.step).toBe(2);

    act(() => {
      result.current.handleBack();
    });
    expect(result.current.step).toBe(1);
  });

  it("submits step 2 and moves to review on success", async () => {
    server.use(
      http.post(apiUrl("/auth/register/guide"), () => {
        return HttpResponse.json({ access_token: "a", refresh_token: "r", token_type: "bearer" }, { status: 201 });
      }),
      http.get(apiUrl("/auth/me"), () => HttpResponse.json({ id: "u1", email: "samuel@example.com", signup_type: "guide" }))
    );

    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());

    act(() => {
      result.current.setField("fullName", "Samuel Samuels");
      result.current.setField("dateOfBirth", "15/08/1995");
      result.current.setField("phoneNumber", "8012345678");
    });

    await act(async () => {
      await result.current.handleContinue();
    });

    act(() => {
      result.current.setField("email", "samuel@example.com");
      result.current.setField("password", "strongpassword123");
    });

    await act(async () => {
      await result.current.handleContinue();
    });

    expect(result.current.step).toBe("review");
  });

  it("stays on step 2 when registration fails", async () => {
    server.use(
      http.post(apiUrl("/auth/register/guide"), () => {
        return HttpResponse.json({ detail: "Registration failed" }, { status: 400 });
      })
    );

    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());

    act(() => {
      result.current.setField("fullName", "Samuel Samuels");
      result.current.setField("dateOfBirth", "15/08/1995");
      result.current.setField("phoneNumber", "8012345678");
    });

    await act(async () => {
      await result.current.handleContinue();
    });

    act(() => {
      result.current.setField("email", "samuel@example.com");
      result.current.setField("password", "strongpassword123");
    });

    await act(async () => {
      await result.current.handleContinue();
    });

    expect(result.current.step).toBe(2);
  });

  it("takes the new guide to their dashboard when they're done", () => {
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    act(() => result.current.handleDone());
    expect(mockPush).toHaveBeenCalledWith("/host/dashboard");
  });

  it("offers to log in when the email already has an account, keeping the form", async () => {
    server.use(
      http.post(apiUrl("/auth/register/guide"), () =>
        HttpResponse.json({ detail: "This email is already registered with Myjourny." }, { status: 409 })
      )
    );
    const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());
    await fillStep1(result);
    act(() => {
      result.current.setField("email", "amara@example.com");
      result.current.setField("password", "strongpassword123");
    });

    await act(async () => {
      await result.current.handleContinue();
    });
    expect(result.current.step).toBe(2);
    expect(result.current.accountExists).toBe(true);

    act(() => result.current.handleLogIn());
    expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fbecome-a-guide%2Fapply");
    const draft = JSON.parse(window.sessionStorage.getItem("myjourny:guide-application-draft")!);
    expect(draft.fullName).toBe("Amara Okafor");
    expect(draft.password).toBe("");

    // Back from logging in, they're on step 2 with what they typed.
    const back = renderHookWithProviders(() => useGuideApplicationViewModel());
    await waitFor(() => expect(back.result.current.step).toBe(2));
    expect(back.result.current.formData.fullName).toBe("Amara Okafor");
  });

  describe("signed in as a traveller", () => {
    it("adds hosting to the account without asking for an email or password", async () => {
      const sent: { body: unknown } = { body: null };
      server.use(
        http.get(apiUrl("/auth/me"), () =>
          HttpResponse.json({ id: "u1", email: "amara@example.com", full_name: "Amara Okafor", signup_type: "traveller", is_host: false })
        ),
        http.post(apiUrl("/auth/me/host"), async ({ request }) => {
          sent.body = await request.json();
          return HttpResponse.json(
            { id: "u1", email: "amara@example.com", signup_type: "both", guide_status: "pending", is_host: true },
            { status: 201 }
          );
        })
      );
      setAuth(
        { access_token: "a", refresh_token: "r" },
        { id: "u1", email: "amara@example.com", fullName: "Amara Okafor", avatarUrl: null }
      );
      const { result } = renderHookWithProviders(() => useGuideApplicationViewModel());

      await waitFor(() => expect(result.current.signedInEmail).toBe("amara@example.com"));
      expect(result.current.formData.fullName).toBe("Amara Okafor");
      await fillStep1(result);
      await act(async () => {
        await result.current.handleContinue();
      });

      expect(result.current.step).toBe("review");
      expect(sent.body).not.toHaveProperty("email");
      expect(sent.body).not.toHaveProperty("password");
      expect(sent.body).toMatchObject({ full_name: "Amara Okafor", city: "Lagos" });
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("sends someone who already hosts to the host dashboard", async () => {
      server.use(
        http.get(apiUrl("/auth/me"), () =>
          HttpResponse.json({ id: "u1", email: "amara@example.com", signup_type: "both", is_host: true })
        )
      );
      setAuth({ access_token: "a", refresh_token: "r" }, { id: "u1", email: "amara@example.com", fullName: null, avatarUrl: null });
      renderHookWithProviders(() => useGuideApplicationViewModel());

      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/host/dashboard"));
    });
  });
});
