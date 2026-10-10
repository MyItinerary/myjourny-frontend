import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { detectTasteDrift, humanizeSlug, useTasteDrift } from "./taste-drift";

const mocks = vi.hoisted(() => ({
  user: { id: "u1" } as { id: string } | null,
  profile: { data: undefined as { interests?: string[] } | undefined },
  bookings: {} as Record<string, { isPending: boolean; data?: { pages: { items: unknown[] }[] } }>,
  categories: { data: undefined as { slug: string; text: string }[] | undefined },
  details: [] as { isPending: boolean; data?: { interest_tags?: string[] | null } }[],
}));

vi.mock("@/lib/auth/session-store", () => ({ useSession: () => ({ user: mocks.user }) }));
vi.mock("@/lib/queries/profile", () => ({ useGetProfile: () => mocks.profile }));
vi.mock("@/lib/queries/categories", () => ({ useInterestCategories: () => mocks.categories }));
vi.mock("@/lib/queries/bookings", () => ({ useMyBookings: (tab: string) => mocks.bookings[tab] }));
vi.mock("@tanstack/react-query", () => ({ useQueries: () => mocks.details }));

const booking = (experience_id: string, status = "completed") => ({ experience_id, status });
const water = ["water-activities"];

describe("detectTasteDrift", () => {
  it("finds a category booked three times outside the saved interests", () => {
    expect(detectTasteDrift({ savedInterests: ["art", "food"], bookedTags: [water, water, water] })).toEqual({
      count: 3,
      tag: "water-activities",
    });
  });

  it("needs three bookings", () => {
    expect(detectTasteDrift({ savedInterests: ["art"], bookedTags: [water, water] })).toBeNull();
  });

  it("ignores bookings that touch a saved interest", () => {
    const tags = [["art-creativity", "water-activities"]];
    expect(detectTasteDrift({ savedInterests: ["art"], bookedTags: [...tags, ...tags, ...tags] })).toBeNull();
  });

  it("matches slugs to quiz ids by word or exactly", () => {
    const tags = [["local-food-drinks"], ["street-life"], ["art-creativity"]];
    expect(detectTasteDrift({ savedInterests: ["food", "street-life", "art"], bookedTags: tags })).toBeNull();
  });

  it("picks the most-booked category", () => {
    const night = ["nightlife"];
    const found = detectTasteDrift({
      savedInterests: ["art"],
      bookedTags: [water, water, water, night, night, night, night],
    });
    expect(found).toEqual({ count: 4, tag: "nightlife" });
  });

  it("does nothing without saved interests", () => {
    expect(detectTasteDrift({ savedInterests: [], bookedTags: [water, water, water] })).toBeNull();
  });
});

describe("humanizeSlug", () => {
  it("turns a slug into words", () => {
    expect(humanizeSlug("water-activities")).toBe("water activities");
  });
});

describe("useTasteDrift", () => {
  beforeEach(() => {
    mocks.user = { id: "u1" };
    mocks.profile = { data: { interests: ["art", "food"] } };
    mocks.bookings = {
      upcoming: { isPending: false, data: { pages: [{ items: [booking("e1", "confirmed")] }] } },
      past: {
        isPending: false,
        data: { pages: [{ items: [booking("e2"), booking("e3"), booking("e1"), booking("e4", "cancelled")] }] },
      },
    };
    mocks.categories = { data: [{ slug: "water-activities", text: "Water Activities" }] };
    mocks.details = [
      { isPending: false, data: { interest_tags: water } },
      { isPending: false, data: { interest_tags: water } },
      { isPending: false, data: { interest_tags: water } },
    ];
  });

  it("is null when disabled or signed out", () => {
    expect(renderHook(() => useTasteDrift(false)).result.current).toBeNull();
    mocks.user = null;
    expect(renderHook(() => useTasteDrift(true)).result.current).toBeNull();
  });

  it("is undefined while anything is loading", () => {
    mocks.profile = { data: undefined };
    expect(renderHook(() => useTasteDrift(true)).result.current).toBeUndefined();

    mocks.profile = { data: { interests: ["art"] } };
    mocks.details = [{ isPending: true }];
    expect(renderHook(() => useTasteDrift(true)).result.current).toBeUndefined();

    mocks.details = [];
    mocks.bookings.past = { isPending: true };
    expect(renderHook(() => useTasteDrift(true)).result.current).toBeUndefined();
  });

  it("reports the drifted category and the saved interests by name", () => {
    expect(renderHook(() => useTasteDrift(true)).result.current).toEqual({
      count: 3,
      category: "water activities",
      interests: ["art & creativity", "local food & drinks"],
    });
  });

  it("falls back to the slug when the category isn't listed", () => {
    mocks.categories = { data: undefined };
    expect(renderHook(() => useTasteDrift(true)).result.current).toMatchObject({ category: "water activities" });
  });

  it("is null when bookings still match the quiz", () => {
    mocks.details = [{ isPending: false, data: { interest_tags: ["art-creativity"] } }, { isPending: false }];
    expect(renderHook(() => useTasteDrift(true)).result.current).toBeNull();
  });
});
