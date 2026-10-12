import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { EMAIL_LOOKUP_PATH, isEmailTakenError, useEmailHasAccount } from "./guest-account";

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

describe("useEmailHasAccount", () => {
  it("looks up a valid email once typing settles", async () => {
    const asked: unknown[] = [];
    server.use(
      http.post(apiUrl(EMAIL_LOOKUP_PATH), async ({ request }) => {
        asked.push(await request.json());
        return HttpResponse.json({ exists: true });
      }),
    );
    const { result } = renderHookWithProviders(() => useEmailHasAccount(" Juliet@Example.com "));

    expect(result.current.exists).toBe(false);
    await waitFor(() => expect(result.current.exists).toBe(true));
    expect(result.current.checking).toBe(false);
    expect(asked).toEqual([{ email: "juliet@example.com" }]);
  });

  it("says a new email has no account", async () => {
    server.use(http.post(apiUrl(EMAIL_LOOKUP_PATH), () => HttpResponse.json({ exists: false })));
    const { result } = renderHookWithProviders(() => useEmailHasAccount("new@example.com"));

    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(result.current.exists).toBe(false);
  });

  it("treats the email as new when the lookup fails", async () => {
    server.use(http.post(apiUrl(EMAIL_LOOKUP_PATH), () => HttpResponse.json({}, { status: 404 })));
    const { result } = renderHookWithProviders(() => useEmailHasAccount("juliet@example.com"));

    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(result.current.exists).toBe(false);
  });

  it("doesn't look up something that isn't an email", () => {
    const { result } = renderHookWithProviders(() => useEmailHasAccount("not-an-email"));
    expect(result.current).toEqual({ exists: false, checking: false });
  });
});
