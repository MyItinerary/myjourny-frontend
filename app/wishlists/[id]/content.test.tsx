import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { WishlistDetailContent } from "./content";

const wishlistState = vi.hoisted(() => ({
  experiences: [] as unknown[],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  collections: [
    {
      id: "w-1",
      name: "Weekend Getaways",
      item_count: 3,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-06-01T00:00:00Z",
      cover_image_url: null,
    },
  ],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav data-testid="home-nav" /> }));
vi.mock("@/components/home/footer", () => ({ Footer: () => <footer data-testid="footer" /> }));
vi.mock("@/components/wishlists/wishlist-dialogs", () => ({
  NameWishlistDialog: () => null,
  DeleteWishlistDialog: () => null,
}));

vi.mock("@/lib/queries/wishlists", () => ({
  useWishlists: () => ({ data: wishlistState.collections }),
  useWishlistExperiences: () => ({
    data: wishlistState.experiences,
    isLoading: wishlistState.isLoading,
    isError: wishlistState.isError,
    refetch: wishlistState.refetch,
  }),
  useRemoveFromWishlist: () => ({ mutate: vi.fn() }),
  useDeleteWishlist: () => ({ mutate: vi.fn(), isPending: false }),
  useRenameWishlist: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe("WishlistDetailContent", () => {
  it("shows loading indicators while experiences are being fetched", () => {
    wishlistState.isLoading = true;
    wishlistState.isError = false;
    wishlistState.experiences = [];

    renderWithProviders(<WishlistDetailContent id="w-1" />);

    expect(screen.getByText(/Loading experiences…/i)).toBeInTheDocument();
    expect(screen.getByText("Loading saved experiences...")).toBeInTheDocument();
    expect(screen.queryByText("This wishlist is empty")).not.toBeInTheDocument();
  });

  it("shows error state and retries on 'Try again' click", async () => {
    const handleRefetch = vi.fn();
    wishlistState.isLoading = false;
    wishlistState.isError = true;
    wishlistState.experiences = [];
    wishlistState.refetch = handleRefetch;

    const { user } = renderWithProviders(<WishlistDetailContent id="w-1" />);

    expect(screen.getAllByText("Failed to load experiences").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/We couldn't load the experiences in this wishlist/i)
    ).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "Try again" });
    await user.click(retryButton);
    expect(handleRefetch).toHaveBeenCalledOnce();
  });

  it("shows empty state when wishlist has zero experiences", () => {
    wishlistState.isLoading = false;
    wishlistState.isError = false;
    wishlistState.experiences = [];

    renderWithProviders(<WishlistDetailContent id="w-1" />);

    expect(screen.getByText("This wishlist is empty")).toBeInTheDocument();
    expect(screen.getByText(/0 experiences saved/i)).toBeInTheDocument();
  });

  it("renders saved experiences when loaded", () => {
    wishlistState.isLoading = false;
    wishlistState.isError = false;
    wishlistState.experiences = [
      {
        id: "wi-1",
        experienceId: "exp-1",
        title: "Tarkwa Bay Boat Tour",
        imageUrl: "/images/surf.jpg",
        price: 15000,
        currency: "NGN",
        duration: 3,
        city: "Lagos",
        rating: 4.8,
      },
    ];

    renderWithProviders(<WishlistDetailContent id="w-1" />);

    expect(screen.getByText("Tarkwa Bay Boat Tour")).toBeInTheDocument();
    expect(screen.getByText(/1 experience saved/i)).toBeInTheDocument();
    expect(screen.queryByText("This wishlist is empty")).not.toBeInTheDocument();
  });
});
