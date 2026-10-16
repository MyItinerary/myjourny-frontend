import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useNeedsEmailVerification, useResendVerification, useVerifyEmail } from "./verify-email";

vi.mock("@/lib/auth/session-store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session-store")>()),
  useSession: () => ({ state: "account", user: { id: "u1", email: "ada@example.com", fullName: null, avatarUrl: null } }),
}));

function me(is_email_verified?: boolean) {
  server.use(
    http.get(apiUrl("/auth/me"), () =>
      HttpResponse.json({ id: "u1", email: "ada@example.com", full_name: null, avatar_url: null, completed: true, is_email_verified }),
    ),
  );
}

describe("useVerifyEmail", () => {
  it("sends the token from the link to itin", async () => {
    let token: string | null = null;
    server.use(
      http.get(apiUrl("/auth/email/verify"), ({ request }) => {
        token = new URL(request.url).searchParams.get("token");
        return HttpResponse.json({ message: "Email verified" });
      }),
    );
    const { result } = renderHookWithProviders(() => useVerifyEmail("tok123"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(token).toBe("tok123");
  });

  it("does nothing without a token", () => {
    const { result } = renderHookWithProviders(() => useVerifyEmail(null));

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useResendVerification", () => {
  it("asks itin for a new link", async () => {
    let called = false;
    server.use(
      http.post(apiUrl("/auth/email/resend-verification"), () => {
        called = true;
        return HttpResponse.json({ message: "A verification link was sent to your email" });
      }),
    );
    const { result } = renderHookWithProviders(() => useResendVerification());

    act(() => result.current.mutate());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(called).toBe(true);
  });
});

describe("useNeedsEmailVerification", () => {
  it("is true when itin says the email isn't verified", async () => {
    me(false);
    const { result } = renderHookWithProviders(() => useNeedsEmailVerification());

    await waitFor(() => expect(result.current).toBe(true));
  });

  it("is false once verified, and when the API doesn't say", async () => {
    me(true);
    const verified = renderHookWithProviders(() => useNeedsEmailVerification());
    await waitFor(() => expect(verified.result.current).toBe(false));

    me(undefined);
    const unknown = renderHookWithProviders(() => useNeedsEmailVerification());
    await waitFor(() => expect(unknown.result.current).toBe(false));
  });
});
