import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useGuestEmailSignup } from "./guest-signup";

const session = vi.hoisted(() => ({ user: null as { id: string; email: string | null } | null }));
vi.mock("@/lib/auth/session-store", () => ({
  useSession: () => ({ user: session.user }),
  setAuth: vi.fn(),
  setUser: vi.fn(),
  getTokens: () => ({ accessToken: null, refreshToken: null }),
  clearAuth: vi.fn(),
  setTokens: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  session.user = null;
});

function stub() {
  const calls: string[] = [];
  server.use(
    http.post(apiUrl("/auth/temp"), () => {
      calls.push("temp");
      return HttpResponse.json({ access_token: "a", refresh_token: "r", user_id: "temp-1" });
    }),
    http.post(apiUrl("/auth/activate"), async ({ request }) => {
      const body = (await request.json()) as { user_id: string; email: string };
      calls.push(`activate:${body.user_id}:${body.email}`);
      return HttpResponse.json({ id: body.user_id, email: body.email, full_name: null, avatar_url: null });
    }),
  );
  return calls;
}

describe("useGuestEmailSignup", () => {
  it("makes a temporary user, then activates it with the email", async () => {
    const calls = stub();
    const { result } = renderHookWithProviders(() => useGuestEmailSignup());

    await act(() => result.current.mutateAsync("juliet@example.com"));

    expect(calls).toEqual(["temp", "activate:temp-1:juliet@example.com"]);
  });

  it("reuses the temporary user a failed attempt left behind", async () => {
    session.user = { id: "temp-9", email: null };
    const calls = stub();
    const { result } = renderHookWithProviders(() => useGuestEmailSignup());

    await act(() => result.current.mutateAsync("juliet@example.com"));

    expect(calls).toEqual(["activate:temp-9:juliet@example.com"]);
  });

  it("fails when the address can't be activated", async () => {
    server.use(
      http.post(apiUrl("/auth/temp"), () => HttpResponse.json({ access_token: "a", user_id: "t" })),
      http.post(apiUrl("/auth/activate"), () => HttpResponse.json({ detail: "Email already in use" }, { status: 409 })),
    );
    const { result } = renderHookWithProviders(() => useGuestEmailSignup());

    act(() => result.current.mutate("taken@example.com"));

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
