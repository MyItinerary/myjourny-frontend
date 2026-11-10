import { act, renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { useGuideApplicationViewModel } from "./use-guide-application-view-model";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("useGuideApplicationViewModel", () => {
  it("initializes on step 1 with default values", () => {
    const { result } = renderHook(() => useGuideApplicationViewModel());

    expect(result.current.step).toBe(1);
    expect(result.current.formData.city).toBe("Lagos");
    expect(result.current.formData.verificationType).toBe("individual");
  });

  it("blocks transition to step 2 when required step 1 fields are empty", async () => {
    const { result } = renderHook(() => useGuideApplicationViewModel());

    await act(async () => {
      await result.current.handleContinue();
    });

    expect(result.current.step).toBe(1);
    expect(result.current.errors.fullName).toBeDefined();
    expect(result.current.errors.dateOfBirth).toBeDefined();
    expect(result.current.errors.phoneNumber).toBeDefined();
  });

  it("refuses a date that isn't real, an applicant under 18 and a phone number that's too short", async () => {
    const { result } = renderHook(() => useGuideApplicationViewModel());
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
    expect(result.current.errors.dateOfBirth).toBe("You need to be at least 18 to guide on MyJourny");
  });

  it("refuses an email address without a domain on step 2", async () => {
    const { result } = renderHook(() => useGuideApplicationViewModel());

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
    const { result } = renderHook(() => useGuideApplicationViewModel());

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
    const { result } = renderHook(() => useGuideApplicationViewModel());

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

    const { result } = renderHook(() => useGuideApplicationViewModel());

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

    const { result } = renderHook(() => useGuideApplicationViewModel());

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
    const { result } = renderHook(() => useGuideApplicationViewModel());
    act(() => result.current.handleDone());
    expect(mockPush).toHaveBeenCalledWith("/host/dashboard");
  });
});
