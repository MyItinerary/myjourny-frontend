import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useVerifyEmailNoticeViewModel } from "./use-verify-email-notice-view-model";

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: (...a: unknown[]) => toastSuccess(...a), error: (...a: unknown[]) => toastError(...a) },
}));

vi.mock("@/lib/auth/session-store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session-store")>()),
  useSession: () => ({ state: "account", user: { id: "u1", email: "ada@example.com", fullName: null, avatarUrl: null } }),
}));

function stubMe(is_email_verified: boolean) {
  server.use(
    http.get(apiUrl("/auth/me"), () =>
      HttpResponse.json({ id: "u1", email: "ada@example.com", full_name: null, avatar_url: null, completed: true, is_email_verified }),
    ),
  );
}

describe("useVerifyEmailNoticeViewModel", () => {
  it("shows for an unverified account and resends the link", async () => {
    stubMe(false);
    server.use(
      http.post(apiUrl("/auth/email/resend-verification"), () =>
        HttpResponse.json({ message: "A verification link was sent to your email" }),
      ),
    );
    const { result } = renderHookWithProviders(() => useVerifyEmailNoticeViewModel());
    await waitFor(() => expect(result.current.visible).toBe(true));

    act(() => result.current.onResend());

    await waitFor(() => expect(result.current.sent).toBe(true));
    expect(toastSuccess).toHaveBeenCalledWith("We've sent you a new link.");
  });

  it("stays hidden for a verified account", async () => {
    stubMe(true);
    const { result } = renderHookWithProviders(() => useVerifyEmailNoticeViewModel());

    await waitFor(() => expect(result.current.visible).toBe(false));
  });

  it("shows itin's reason when it refuses to send another link", async () => {
    stubMe(false);
    server.use(
      http.post(apiUrl("/auth/email/resend-verification"), () =>
        HttpResponse.json({ detail: "Too many requests. Try again in an hour." }, { status: 429 }),
      ),
    );
    const { result } = renderHookWithProviders(() => useVerifyEmailNoticeViewModel());
    await waitFor(() => expect(result.current.visible).toBe(true));

    act(() => result.current.onResend());

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Too many requests. Try again in an hour."));
    expect(result.current.sent).toBe(false);
  });
});
