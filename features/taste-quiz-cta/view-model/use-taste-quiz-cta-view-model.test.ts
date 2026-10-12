import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTasteQuizCtaViewModel } from "./use-taste-quiz-cta-view-model";

const audience = vi.hoisted(() => ({ value: "guest" as string }));
vi.mock("../model/visibility", () => ({ useTasteQuizAudience: () => audience.value }));

describe("useTasteQuizCtaViewModel", () => {
  it("sends guests to sign up, which leads into the quiz", () => {
    audience.value = "guest";
    const { result } = renderHook(() => useTasteQuizCtaViewModel());
    expect(result.current).toEqual({ visible: true, href: "/onboarding" });
  });

  it("sends signed-in users straight into the quiz", () => {
    audience.value = "no-quiz";
    const { result } = renderHook(() => useTasteQuizCtaViewModel());
    expect(result.current).toEqual({ visible: true, href: "/onboarding/get-to-know-you" });
  });

  it("is not visible once the quiz is done", () => {
    audience.value = "taken";
    const { result } = renderHook(() => useTasteQuizCtaViewModel());
    expect(result.current.visible).toBe(false);
  });

  it("is not visible while the session or profile loads", () => {
    audience.value = "hidden";
    const { result } = renderHook(() => useTasteQuizCtaViewModel());
    expect(result.current.visible).toBe(false);
  });
});
