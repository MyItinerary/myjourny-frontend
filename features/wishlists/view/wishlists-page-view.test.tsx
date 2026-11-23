import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { WishlistsPageViewModel } from "../view-model/use-wishlists-page-view-model";
import { WishlistsPageView } from "./wishlists-page-view";

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav data-testid="home-nav" /> }));

const vm = (overrides: Partial<WishlistsPageViewModel> = {}): WishlistsPageViewModel => ({
  status: "ready",
  onRetry: vi.fn(),
  cards: [
    { id: "w-1", name: "Birthday", href: "/wishlists/w-1", subtitle: "1 saved · Updated today", cover: { kind: "single", src: "/canoe.jpg" } },
    { id: "w-2", name: "Accra 2026", href: "/wishlists/w-2", subtitle: "5 saved · Updated today", cover: { kind: "grid", tiles: ["/1.jpg", null, null, null] } },
  ],
  hasMore: false,
  onShowMore: vi.fn(),
  editing: false,
  onToggleEdit: vi.fn(),
  onRequestDelete: vi.fn(),
  deleteDialog: { open: false, name: "", pending: false, onConfirm: vi.fn(), onClose: vi.fn() },
  createDialog: { open: false, pending: false, onOpen: vi.fn(), onSubmit: vi.fn(), onClose: vi.fn() },
  ...overrides,
});

describe("WishlistsPageView", () => {
  it("puts the nav inside the hero, with the title and an Edit button", () => {
    renderWithProviders(<WishlistsPageView {...vm()} />);

    const nav = screen.getByTestId("home-nav");
    expect(nav.parentElement).toContainElement(screen.getByRole("heading", { name: "Saved for later" }));
    expect(screen.getByRole("button", { name: "Edit" })).toHaveAttribute("aria-pressed", "false");
  });

  it("links each collection to its page, and offers a new one", async () => {
    const model = vm();
    const { user } = renderWithProviders(<WishlistsPageView {...model} />);

    expect(screen.getByRole("link", { name: /Birthday/ })).toHaveAttribute("href", "/wishlists/w-1");
    expect(screen.getByText("5 saved · Updated today")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create a new wishlist" }));
    expect(model.createDialog.onOpen).toHaveBeenCalled();
  });

  it("in edit mode, puts a delete button on each collection and stops the links", async () => {
    const model = vm({ editing: true });
    const { user } = renderWithProviders(<WishlistsPageView {...model} />);

    expect(screen.getByRole("button", { name: "Done" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("link", { name: /Birthday/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create a new wishlist" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete Accra 2026" }));
    expect(model.onRequestDelete).toHaveBeenCalledWith("w-2");
  });

  it("asks before deleting a whole collection", () => {
    renderWithProviders(
      <WishlistsPageView {...vm({ editing: true, deleteDialog: { open: true, name: "Birthday", pending: false, onConfirm: vi.fn(), onClose: vi.fn() } })} />,
    );
    expect(screen.getByRole("dialog", { name: "Delete wishlist" })).toHaveTextContent("“Birthday”");
  });

  it("shows the signed-out and empty states without the header", () => {
    const { rerender } = renderWithProviders(<WishlistsPageView {...vm({ status: "signed-out", cards: [] })} />);
    expect(screen.getByText("Save what catches you")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();

    rerender(<WishlistsPageView {...vm({ status: "empty", cards: [] })} />);
    expect(screen.getByText("It’s empty in here")).toBeInTheDocument();
  });

  it("shows a skeleton of the page while the collections load", () => {
    renderWithProviders(<WishlistsPageView {...vm({ status: "loading", cards: [] })} />);

    expect(screen.getByRole("status", { name: "Loading your collections" })).toBeInTheDocument();
    expect(screen.getAllByTestId("collection-skeleton")).toHaveLength(4);
    expect(screen.queryByRole("heading", { name: "Saved for later" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("says when the collections couldn't load, and tries again", async () => {
    const model = vm({ status: "error", cards: [] });
    const { user } = renderWithProviders(<WishlistsPageView {...model} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load your wishlists");
    expect(screen.queryByText("It’s empty in here")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(model.onRetry).toHaveBeenCalled();
  });
});
