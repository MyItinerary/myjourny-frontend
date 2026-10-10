import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { tasteQuizAudience, useTasteQuizAudience } from "./visibility";

const session = vi.hoisted(() => ({ value: { user: null as { id: string } | null, hydrated: true } }));
const profile = vi.hoisted(() => ({ value: { data: undefined as { completed?: boolean } | undefined } }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => session.value }));
vi.mock("@/lib/queries/profile", () => ({ useGetProfile: () => profile.value }));

describe("tasteQuizAudience", () => {
  it("hides until the session has hydrated", () => {
    expect(tasteQuizAudience({ hydrated: false, signedIn: false, profileCompleted: undefined })).toBe("hidden");
  });

  it("shows for guests", () => {
    expect(tasteQuizAudience({ hydrated: true, signedIn: false, profileCompleted: undefined })).toBe("guest");
  });

  it("hides for a signed-in user while the profile loads", () => {
    expect(tasteQuizAudience({ hydrated: true, signedIn: true, profileCompleted: undefined })).toBe("hidden");
  });

  it("shows for a signed-in user who hasn't taken the quiz", () => {
    expect(tasteQuizAudience({ hydrated: true, signedIn: true, profileCompleted: false })).toBe("no-quiz");
  });

  it("marks a signed-in user who has taken the quiz as taken", () => {
    expect(tasteQuizAudience({ hydrated: true, signedIn: true, profileCompleted: true })).toBe("taken");
  });
});

describe("useTasteQuizAudience", () => {
  beforeEach(() => {
    session.value = { user: null, hydrated: true };
    profile.value = { data: undefined };
  });

  it("treats a guest as a guest", () => {
    expect(renderHook(() => useTasteQuizAudience()).result.current).toBe("guest");
  });

  it("reads `completed` off the signed-in profile", () => {
    session.value = { user: { id: "u1" }, hydrated: true };
    profile.value = { data: {} };
    expect(renderHook(() => useTasteQuizAudience()).result.current).toBe("no-quiz");

    profile.value = { data: { completed: true } };
    expect(renderHook(() => useTasteQuizAudience()).result.current).toBe("taken");
  });
});
