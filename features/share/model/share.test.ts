import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { activeReferralCode, buildShareUrl, captureReferral, shareTargets, storedReferral, useReferralCode } from "./share";

describe("buildShareUrl", () => {
  it("is the page alone without a referral code", () => {
    expect(buildShareUrl("https://myjourny.com", "/experiences/abc")).toBe("https://myjourny.com/experiences/abc");
  });

  it("carries the referral code when there is one", () => {
    expect(buildShareUrl("https://myjourny.com", "/events/sample", "DANIEL10")).toBe(
      "https://myjourny.com/events/sample?ref=DANIEL10",
    );
  });

  it("does not throw without an origin, as when the page renders on the server", () => {
    expect(buildShareUrl("", "/experiences/abc")).toBe("/experiences/abc");
    expect(buildShareUrl("", "/events/sample", "DANIEL10")).toBe("/events/sample?ref=DANIEL10");
  });

  it("keeps the page's own query", () => {
    expect(buildShareUrl("https://myjourny.com", "/experiences/abc?date=2026-09-12", "X")).toBe(
      "https://myjourny.com/experiences/abc?date=2026-09-12&ref=X",
    );
  });
});

describe("shareTargets", () => {
  const targets = shareTargets("https://myjourny.com/e/1?ref=A", "Try Kayaking");
  const href = (id: string) => targets.find((t) => t.id === id)!.href;

  it("sends the link to every channel", () => {
    expect(targets.map((t) => t.id)).toEqual(["email", "messages", "whatsapp", "messenger", "facebook", "twitter"]);
    expect(href("whatsapp")).toBe(
      "https://wa.me/?text=" + encodeURIComponent("Try Kayaking https://myjourny.com/e/1?ref=A"),
    );
    expect(href("facebook")).toContain(encodeURIComponent("https://myjourny.com/e/1?ref=A"));
    expect(href("twitter")).toContain("text=Try%20Kayaking");
    expect(href("email")).toMatch(/^mailto:\?subject=Try%20Kayaking&body=/);
    expect(href("messages")).toMatch(/^sms:/);
  });
});

describe("activeReferralCode", () => {
  it("is the code while the campaign is active, else none", () => {
    expect(activeReferralCode({ code: "DANIEL10", active: true })).toBe("DANIEL10");
    expect(activeReferralCode({ code: "DANIEL10" })).toBe("DANIEL10");
    expect(activeReferralCode({ code: "DANIEL10", active: false })).toBeNull();
    expect(activeReferralCode({ code: "" })).toBeNull();
    expect(activeReferralCode([])).toBeNull();
    expect(activeReferralCode(null)).toBeNull();
  });
});

describe("useReferralCode", () => {
  it("loads the signed-in user's active code", async () => {
    server.use(http.get(apiUrl("/referrals/me"), () => HttpResponse.json({ code: "DANIEL10", active: true })));
    const { result } = renderHookWithProviders(() => useReferralCode(true));
    await waitFor(() => expect(result.current.data).toBe("DANIEL10"));
  });

  it("is none when there is no referral programme", async () => {
    server.use(http.get(apiUrl("/referrals/me"), () => HttpResponse.json({}, { status: 404 })));
    const { result } = renderHookWithProviders(() => useReferralCode(true));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("does not ask while signed out", () => {
    const { result } = renderHookWithProviders(() => useReferralCode(false));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("captureReferral", () => {
  it("remembers the code on the link the visitor arrived through", () => {
    expect(captureReferral("?ref=DANIEL10")).toBe("DANIEL10");
    expect(storedReferral()).toBe("DANIEL10");
  });

  it("does nothing without a code", () => {
    window.localStorage.clear();
    expect(captureReferral("?date=2026-09-12")).toBeNull();
    expect(storedReferral()).toBeNull();
  });

  it("survives blocked storage", () => {
    const blocked = {
      setItem: () => {
        throw new Error("blocked");
      },
      getItem: () => {
        throw new Error("blocked");
      },
    };
    expect(captureReferral("?ref=A", blocked)).toBe("A");
    expect(storedReferral(blocked)).toBeNull();
  });
});
