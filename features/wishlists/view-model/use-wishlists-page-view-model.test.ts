import { act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useWishlistsPageViewModel } from "./use-wishlists-page-view-model";

const session = vi.hoisted(() => ({ user: { email: "ngozi@example.com" } as null | { email: string }, hydrated: true }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => session }));

const collection = (id: string, name: string, item_count: number) => ({
  id,
  name,
  item_count,
  cover_image_url: `/${id}.jpg`,
  created_at: "2026-11-01T00:00:00Z",
  updated_at: new Date().toISOString(),
});
const state = vi.hoisted(() => ({
  collections: [] as ReturnType<typeof collection>[],
  isLoading: false,
  create: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@/lib/queries/wishlists", () => ({
  useWishlists: () => ({ data: state.collections, isLoading: state.isLoading }),
  useCreateWishlist: () => ({ mutate: state.create, isPending: false }),
  useDeleteWishlist: () => ({ mutate: state.remove, isPending: false }),
}));
const images = vi.hoisted(() => ({ byId: {} as Record<string, (string | null)[] | undefined> }));
vi.mock("../model/wishlist-covers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../model/wishlist-covers")>();
  return {
    ...actual,
    useWishlistCoverLayouts: (collections: { id: string; item_count: number; cover_image_url: string | null }[]) =>
      Object.fromEntries(collections.map((c) => [c.id, actual.coverLayout(c.item_count, images.byId[c.id], c.cover_image_url)])),
  };
});

afterEach(() => {
  session.user = { email: "ngozi@example.com" };
  session.hydrated = true;
  state.collections = [];
  state.isLoading = false;
  images.byId = {};
  vi.clearAllMocks();
});

describe("useWishlistsPageViewModel", () => {
  it("knows signed out, loading and empty", () => {
    session.user = null;
    expect(renderHookWithProviders(() => useWishlistsPageViewModel()).result.current.status).toBe("signed-out");

    session.user = { email: "ngozi@example.com" };
    state.isLoading = true;
    expect(renderHookWithProviders(() => useWishlistsPageViewModel()).result.current.status).toBe("loading");

    state.isLoading = false;
    expect(renderHookWithProviders(() => useWishlistsPageViewModel()).result.current.status).toBe("empty");
  });

  it("gives each collection its cover: one image, or a grid of up to four", () => {
    state.collections = [collection("w-1", "Birthday", 1), collection("w-2", "Accra 2026", 5), collection("w-3", "Later", 0)];
    images.byId = { "w-1": ["/canoe.jpg"], "w-2": ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"] };
    const { result } = renderHookWithProviders(() => useWishlistsPageViewModel());

    expect(result.current.status).toBe("ready");
    expect(result.current.cards.map((c) => c.cover)).toEqual([
      { kind: "single", src: "/canoe.jpg" },
      { kind: "grid", tiles: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg"] },
      { kind: "empty" },
    ]);
    expect(result.current.cards[0]).toMatchObject({ name: "Birthday", href: "/wishlists/w-1", subtitle: "1 saved · Updated today" });
  });

  it("shows seven collections, then the rest behind Show more", () => {
    state.collections = Array.from({ length: 9 }, (_, i) => collection(`w-${i}`, `List ${i}`, 0));
    const { result } = renderHookWithProviders(() => useWishlistsPageViewModel());

    expect(result.current.cards).toHaveLength(7);
    act(() => result.current.onShowMore());
    expect(result.current.cards).toHaveLength(9);
    expect(result.current.hasMore).toBe(false);
  });

  it("deletes a whole collection from edit mode, after confirming", () => {
    state.collections = [collection("w-1", "Birthday", 1)];
    state.remove.mockImplementation((_id: string, options: { onSuccess: () => void }) => options.onSuccess());
    const { result } = renderHookWithProviders(() => useWishlistsPageViewModel());

    act(() => result.current.onToggleEdit());
    expect(result.current.editing).toBe(true);
    act(() => result.current.onRequestDelete("w-1"));
    expect(result.current.deleteDialog).toMatchObject({ open: true, name: "Birthday" });

    act(() => result.current.deleteDialog.onConfirm());
    expect(state.remove).toHaveBeenCalledWith("w-1", expect.anything());
    expect(result.current.deleteDialog.open).toBe(false);

    act(() => result.current.onToggleEdit());
    expect(result.current.editing).toBe(false);
  });

  it("can back out of a delete", () => {
    state.collections = [collection("w-1", "Birthday", 1)];
    const { result } = renderHookWithProviders(() => useWishlistsPageViewModel());

    act(() => result.current.onRequestDelete("w-1"));
    act(() => result.current.deleteDialog.onClose());
    expect(result.current.deleteDialog.open).toBe(false);
    expect(state.remove).not.toHaveBeenCalled();
  });

  it("creates a collection and closes the dialog", () => {
    state.collections = [collection("w-1", "Birthday", 1)];
    state.create.mockImplementation((_name: string, options: { onSuccess: () => void }) => options.onSuccess());
    const { result } = renderHookWithProviders(() => useWishlistsPageViewModel());

    act(() => result.current.createDialog.onOpen());
    expect(result.current.createDialog.open).toBe(true);
    act(() => result.current.createDialog.onSubmit("Lagos 2027"));
    expect(state.create).toHaveBeenCalledWith("Lagos 2027", expect.anything());
    expect(result.current.createDialog.open).toBe(false);
  });
});
