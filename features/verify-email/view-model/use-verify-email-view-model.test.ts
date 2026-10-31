import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useVerifyEmailViewModel } from "./use-verify-email-view-model";

let params = new URLSearchParams();
vi.mock("next/navigation", () => ({ useSearchParams: () => params }));

let signedIn = false;
vi.mock("@/lib/auth/session-store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session-store")>()),
  useSession: () =>
    signedIn
      ? { state: "account", user: { id: "u1", email: "ada@example.com", fullName: null, avatarUrl: null } }
      : { state: "guest", user: null },
}));

function stubVerify(status = 200, body: Record<string, unknown> = { message: "Email verified" }) {
  const calls: string[] = [];
  server.use(
    http.get(apiUrl("/auth/email/verify"), ({ request }) => {
      calls.push(new URL(request.url).searchParams.get("token") ?? "");
      return HttpResponse.json(body, { status });
    }),
  );
  return calls;
}

beforeEach(() => {
  params = new URLSearchParams();
  signedIn = false;
});

describe("useVerifyEmailViewModel", () => {
  it("verifies the token once and invites a signed-in person to explore", async () => {
    params = new URLSearchParams("token=tok123");
    signedIn = true;
    const calls = stubVerify();

    const { result } = renderHookWithProviders(() => useVerifyEmailViewModel(), { reactStrictMode: true });

    await waitFor(() => expect(result.current.status).toBe("verified"));
    expect(calls).toEqual(["tok123"]);
    expect(result.current.heading).toBe("Email verified");
    expect(result.current.ctaHref).toBe("/");
  });

  it("sends a signed-out person to log in after verifying", async () => {
    params = new URLSearchParams("token=tok123");
    stubVerify();

    const { result } = renderHookWithProviders(() => useVerifyEmailViewModel());

    await waitFor(() => expect(result.current.status).toBe("verified"));
    expect(result.current.ctaLabel).toBe("Log in");
    expect(result.current.ctaHref).toBe("/login");
  });

  it("shows itin's reason when the link has expired or been used", async () => {
    params = new URLSearchParams("token=old");
    stubVerify(400, { detail: "This link has expired or was already used" });

    const { result } = renderHookWithProviders(() => useVerifyEmailViewModel());

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.subtitle).toBe("This link has expired or was already used");
  });

  it("explains a link with no token without calling itin", () => {
    const calls = stubVerify();

    const { result } = renderHookWithProviders(() => useVerifyEmailViewModel());

    expect(result.current.status).toBe("failed");
    expect(result.current.subtitle).toMatch(/missing its code/);
    expect(calls).toEqual([]);
  });

  it("says it's working while the request is in flight", () => {
    params = new URLSearchParams("token=tok123");
    stubVerify();

    const { result } = renderHookWithProviders(() => useVerifyEmailViewModel());

    expect(result.current.status).toBe("verifying");
    expect(result.current.heading).toBe("Verifying your email…");
  });
});
