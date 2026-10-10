import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTasteQuizSectionViewModel } from "./use-taste-quiz-section-view-model";

const state = vi.hoisted(() => ({ audience: "guest", drift: null as unknown }));
vi.mock("../model/visibility", () => ({ useTasteQuizAudience: () => state.audience }));
vi.mock("../model/taste-drift", () => ({ useTasteDrift: () => state.drift }));

const drift = { count: 3, category: "water activities", interests: ["art", "food"] };

describe("useTasteQuizSectionViewModel", () => {
  beforeEach(() => {
    state.audience = "guest";
    state.drift = null;
  });

  it("pitches guests the quiz via sign-up", () => {
    const { result } = renderHook(() => useTasteQuizSectionViewModel());
    expect(result.current).toEqual({ visible: true, href: "/onboarding" });
  });

  it("pitches signed-in users without a finished quiz the quiz itself", () => {
    state.audience = "no-quiz";
    const { result } = renderHook(() => useTasteQuizSectionViewModel());
    expect(result.current).toEqual({ visible: true, href: "/onboarding/get-to-know-you" });
  });

  it("shows the drifted copy to a quiz-taker whose bookings moved on", () => {
    state.audience = "taken";
    state.drift = drift;
    const { result } = renderHook(() => useTasteQuizSectionViewModel());
    expect(result.current.visible).toBe(true);
    expect(result.current.href).toBe("/onboarding/get-to-know-you");
    expect(result.current.title).toBe("Your taste has drifted.");
    expect(result.current.body).toContain("three experiences in water activities");
    expect(result.current.ctaLabel).toBe("Update my taste");
  });

  it.each([
    ["taken", null],
    ["taken", undefined],
    ["hidden", null],
  ])("stays hidden for %s with drift %s", (audience, d) => {
    state.audience = audience;
    state.drift = d;
    const { result } = renderHook(() => useTasteQuizSectionViewModel());
    expect(result.current.visible).toBe(false);
  });
});
