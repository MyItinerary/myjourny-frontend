import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { ExperienceCardVertical } from "./experience-card-vertical";

const mockOpenSave = vi.fn();
vi.mock("@/components/wishlists/wishlist-save-provider", () => ({
  useWishlistSave: () => ({ openSave: mockOpenSave }),
}));

vi.mock("@/lib/queries/wishlists", () => ({
  useMyWishlistedIds: () => ({ data: new Set(["saved-exp"]) }),
}));

const defaultProps = {
  id: "exp-123",
  imageSrc: "/images/home/experiences/kayaking.jpg",
  imageAlt: "Kayaking Adventure",
  category: "Outdoor",
  title: "Kayaking Adventure in Lagos",
  duration: "2 hours",
  rating: 4.8,
  reviewCount: 12,
  priceFrom: 15000,
  currency: "NGN",
};

describe("ExperienceCardVertical", () => {
  it("renders card content and links to the experience details page", () => {
    renderWithProviders(<ExperienceCardVertical {...defaultProps} />);

    expect(screen.getByText("Kayaking Adventure in Lagos")).toBeInTheDocument();
    expect(screen.getByText("Outdoor")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Kayaking Adventure in Lagos" });
    expect(link).toHaveAttribute("href", "/experiences/exp-123");
    expect(link).toHaveClass("absolute", "inset-0", "cursor-pointer");
  });

  it("ensures the image container allows clicks to pass through to the link", () => {
    renderWithProviders(<ExperienceCardVertical {...defaultProps} />);

    const image = screen.getByAltText("Kayaking Adventure");
    const imageContainer = image.parentElement;
    expect(imageContainer).toHaveClass("pointer-events-none");
  });

  it("handles the wishlist save button with pointer-events-auto", async () => {
    const { user } = renderWithProviders(<ExperienceCardVertical {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: "Save to wishlist" });
    expect(saveButton).toHaveClass("pointer-events-auto", "cursor-pointer");

    await user.click(saveButton);
    expect(mockOpenSave).toHaveBeenCalledWith("exp-123", "Kayaking Adventure in Lagos");
  });

  it("shows saved state when experience is already in wishlists", () => {
    renderWithProviders(
      <ExperienceCardVertical
        {...defaultProps}
        id="saved-exp"
        title="Saved Kayaking"
      />,
    );

    expect(screen.getByRole("button", { name: "Edit wishlists" })).toBeInTheDocument();
  });

  it("renders without a link when id is omitted", () => {
    renderWithProviders(
      <ExperienceCardVertical
        {...defaultProps}
        id={undefined}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
