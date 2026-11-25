import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { WishlistCoverView } from "./wishlist-cover-view";

describe("WishlistCoverView", () => {
  it("fills the cover with one image", () => {
    const { container } = renderWithProviders(<WishlistCoverView cover={{ kind: "single", src: "/canoe.jpg" }} />);

    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.queryByTestId("cover-grid")).not.toBeInTheDocument();
  });

  it("lays out four tiles, grey where there's no image", () => {
    const { container } = renderWithProviders(<WishlistCoverView cover={{ kind: "grid", tiles: ["/1.jpg", "/2.jpg", null, null] }} />);

    const grid = screen.getByTestId("cover-grid");
    expect(grid.children).toHaveLength(4);
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  it("shows no image when the collection is empty", () => {
    const { container } = renderWithProviders(<WishlistCoverView cover={{ kind: "empty" }} />);
    expect(container.querySelector("img")).toBeNull();
  });
});
