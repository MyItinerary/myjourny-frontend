import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { SaveToCollectionModal } from "./save-to-collection-modal";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
const session = vi.hoisted(() => ({ user: { email: "ngozi@example.com" } as null | { email: string } }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => session }));

const collection = (id: string, name: string, item_count: number) => ({
  id,
  name,
  item_count,
  cover_image_url: null,
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
});
const state = vi.hoisted(() => ({
  collections: [] as unknown[],
  savedIn: [] as string[],
  add: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@/lib/queries/wishlists", () => ({
  useWishlists: () => ({ data: state.collections, isLoading: false }),
  useCheckWishlisted: () => ({ data: { saved: state.savedIn.length > 0, collection_ids: state.savedIn } }),
  useAddToWishlist: () => ({ mutate: state.add, isPending: false }),
  useRemoveFromWishlist: () => ({ mutate: state.remove, isPending: false }),
  useCreateWishlist: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/features/wishlists", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/wishlists")>()),
  useWishlistCoverLayouts: (collections: { id: string }[]) =>
    Object.fromEntries(collections.map((c) => [c.id, { kind: "grid", tiles: ["/1.jpg", "/2.jpg", null, null] }])),
}));

afterEach(() => {
  session.user = { email: "ngozi@example.com" };
  state.collections = [];
  state.savedIn = [];
  vi.clearAllMocks();
});

function open(onClose = vi.fn()) {
  return { onClose, ...renderWithProviders(<SaveToCollectionModal experienceId="exp-1" isOpen onClose={onClose} />) };
}

describe("SaveToCollectionModal", () => {
  it("lists the collections with the My wishlists covers, in a list that scrolls past four", () => {
    state.collections = ["a", "b", "c", "d", "e"].map((id, i) => collection(id, `List ${i + 1}`, 3));
    open();

    const dialog = screen.getByRole("dialog", { name: "Save to wishlist" });
    expect(screen.getAllByTestId("cover-grid")).toHaveLength(5);
    const list = screen.getByRole("button", { name: /List 1/ }).closest(".overflow-y-auto");
    expect(list).toHaveClass("max-h-[min(480px,55dvh)]");
    expect(dialog).toHaveClass("max-w-[440px]");
    expect(screen.getByRole("button", { name: "Create a new wishlist" })).toBeInTheDocument();
  });

  it("closes as soon as the experience is saved to a collection", async () => {
    state.collections = [collection("a", "Birthday", 1)];
    state.add.mockImplementation((_vars: unknown, options: { onSuccess: () => void }) => options.onSuccess());
    const { user, onClose } = open();

    await user.click(screen.getByRole("button", { name: /Birthday/ }));
    expect(state.add).toHaveBeenCalledWith({ collectionId: "a", experienceId: "exp-1" }, expect.anything());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("takes it out of a collection it's already in, and stays open", async () => {
    state.collections = [collection("a", "Birthday", 1)];
    state.savedIn = ["a"];
    const { user, onClose } = open();

    const saved = screen.getByRole("button", { name: /Birthday/ });
    expect(saved).toHaveAttribute("aria-pressed", "true");
    await user.click(saved);
    expect(state.remove).toHaveBeenCalledWith({ collectionId: "a", experienceId: "exp-1" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("asks people who are signed out to log in or sign up", () => {
    session.user = null;
    open();

    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });
});
