import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { EMAIL_LOOKUP_PATH, isEmailTakenError, useEmailLookup } from "./guest-account";

const failure = (detail: unknown) => ({ response: { data: { detail } } });

describe("isEmailTakenError", () => {
  it("recognises the already-registered response", () => {
    expect(isEmailTakenError(failure("Email already registered"))).toBe(true);
  });

  it("is false for other failures", () => {
    expect(isEmailTakenError(failure("Weak password"))).toBe(false);
    expect(isEmailTakenError(failure(["not", "a string"]))).toBe(false);
    expect(isEmailTakenError(new Error("network"))).toBe(false);
    expect(isEmailTakenError(null)).toBe(false);
  });
});

describe("useEmailLookup", () => {
  it("says whether the email has an account and whether it has a password", async () => {
    const asked: unknown[] = [];
    server.use(
      http.post(apiUrl(EMAIL_LOOKUP_PATH), async ({ request }) => {
        asked.push(await request.json());
        return HttpResponse.json({ exists: true, has_password: false });
      }),
    );
    const { result } = renderHookWithProviders(() => useEmailLookup());

    await expect(result.current.mutateAsync("juliet@example.com")).resolves.toEqual({
      exists: true,
      hasPassword: false,
    });
    expect(asked).toEqual([{ email: "juliet@example.com" }]);
  });

  it("says a new email has no account", async () => {
    server.use(http.post(apiUrl(EMAIL_LOOKUP_PATH), () => HttpResponse.json({ exists: false, has_password: false })));
    const { result } = renderHookWithProviders(() => useEmailLookup());

    await expect(result.current.mutateAsync("new@example.com")).resolves.toEqual({ exists: false, hasPassword: false });
  });

  it("answers null when the lookup fails, so the email is treated as new", async () => {
    server.use(http.post(apiUrl(EMAIL_LOOKUP_PATH), () => HttpResponse.json({}, { status: 429 })));
    const { result } = renderHookWithProviders(() => useEmailLookup());

    await expect(result.current.mutateAsync("juliet@example.com")).resolves.toBeNull();
  });
});
