import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EmptyStateView } from "./empty-state-view";

describe("EmptyStateView", () => {
  it("shows the title and body and links the CTA", () => {
    renderWithProviders(
      <EmptyStateView
        imageSrc="/images/wishlists/empty-wishlist.png"
        title="It’s empty in here"
        body="Saved experiences show up here."
        ctaLabel="Browse experiences"
        href="/"
      />,
    );

    expect(screen.getByRole("heading", { name: "It’s empty in here" })).toBeInTheDocument();
    expect(screen.getByText("Saved experiences show up here.")).toBeInTheDocument();
    expect(screen.getByText("Browse experiences").closest("a")).toHaveAttribute("href", "/");
  });

  it("is sized like an empty wishlist collection, with a small illustration", () => {
    const { container } = renderWithProviders(
      <EmptyStateView imageSrc="/images/wishlists/empty-wishlist.png" title="Nothing yet" body="Book something." ctaLabel="Browse" href="/" />,
    );

    expect(screen.getByRole("heading", { name: "Nothing yet" })).toHaveClass("text-2xl", "font-bold");
    expect(screen.getByText("Book something.")).toHaveClass("text-base");
    expect(container.querySelector("img")?.parentElement).toHaveClass("size-[72px]", "sm:size-[120px]");
  });
});
