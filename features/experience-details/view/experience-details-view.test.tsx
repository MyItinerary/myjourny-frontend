import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { experienceContent as content } from "@/test/fixtures/experience-details";
import { renderWithProviders } from "@/test/utils/render";

import type { ExperienceDetailsViewModel } from "../view-model/use-experience-details-view-model";
import { ExperienceDetailsView } from "./experience-details-view";

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav aria-label="Main" /> }));
vi.mock("@/components/home/footer", () => ({ Footer: () => <footer>Footer</footer> }));
vi.mock("@/components/home/experience-rail-section", () => ({
  ExperienceRailSection: ({ heading }: { heading: string }) => <section aria-label={heading} />,
}));
vi.mock("@/components/wishlists/save-to-collection-modal", () => ({
  SaveToCollectionModal: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div role="dialog">Save</div> : null),
}));
vi.mock("@/features/experience-gallery", () => ({ ExperienceGalleryView: () => <div>Gallery</div> }));
vi.mock("@/features/booking", () => ({
  BookingBarView: ({ priceFrom, onBookNow }: { priceFrom: string; onBookNow: () => void }) => (
    <button onClick={onBookNow}>Bar {priceFrom}</button>
  ),
  ExperienceBookingCardView: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid={onClose ? "sheet-card" : "side-card"}>{onClose && <button onClick={onClose}>Close card</button>}</div>
  ),
}));

function vm(overrides: Partial<ExperienceDetailsViewModel> = {}): ExperienceDetailsViewModel {
  return {
    status: "ready",
    content,
    gallery: {} as ExperienceDetailsViewModel["gallery"],
    reviews: {
      average: 4.8,
      count: 124,
      breakdown: [],
      summary: null,
      query: "",
      onQueryChange: vi.fn(),
      sort: "relevant",
      onSortChange: vi.fn(),
      ratingFilter: 0,
      onRatingFilterChange: vi.fn(),
      rows: [],
      emptyMessage: null,
      showMoreLabel: null,
      onShowMore: vi.fn(),
      onToggleHelpful: vi.fn(),
    },
    booking: {} as ExperienceDetailsViewModel["booking"],
    priceFrom: "₦16,000.00",
    mobileBookingOpen: false,
    onOpenMobileBooking: vi.fn(),
    onCloseMobileBooking: vi.fn(),
    saved: false,
    onToggleSave: vi.fn(),
    saveModalOpen: false,
    onCloseSaveModal: vi.fn(),
    onShare: vi.fn(),
    onBack: vi.fn(),
    similar: [],
    ...overrides,
  };
}

describe("ExperienceDetailsView", () => {
  it("shows the title, meta, gallery, sections, booking card and footer", () => {
    renderWithProviders(<ExperienceDetailsView {...vm()} />);
    expect(screen.getByRole("heading", { level: 1, name: "Sunrise Kayaking" })).toBeInTheDocument();
    expect(screen.getByText("1 hour")).toBeInTheDocument();
    expect(screen.getByText(/4\.0 · Tarkwa Bay, Lagos/)).toBeInTheDocument();
    expect(screen.getByText("Gallery")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About this experience" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByTestId("side-card")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("shows only the location when there is no rating", () => {
    renderWithProviders(<ExperienceDetailsView {...vm({ content: { ...content, rating: null } })} />);
    expect(screen.getAllByText("Tarkwa Bay, Lagos").length).toBeGreaterThan(0);
    expect(screen.queryByText(/4\.0/)).not.toBeInTheDocument();
  });

  it("shows a skeleton while loading and an error with a way home", () => {
    const { rerender } = renderWithProviders(<ExperienceDetailsView {...vm({ status: "loading", content: null })} />);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    rerender(<ExperienceDetailsView {...vm({ status: "error", content: null })} />);
    expect(screen.getByText("Couldn't load this experience")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });

  it("wires back, wishlist and share", async () => {
    const view = vm();
    const { user } = renderWithProviders(<ExperienceDetailsView {...view} />);
    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(screen.getAllByRole("button", { name: "Add to wishlist", hidden: true })[0]);
    await user.click(screen.getAllByRole("button", { name: "Share", hidden: true })[0]);
    expect(view.onBack).toHaveBeenCalled();
    expect(view.onToggleSave).toHaveBeenCalled();
    expect(view.onShare).toHaveBeenCalled();
  });

  it("opens the mobile booking sheet from the bar and closes it", async () => {
    const view = vm();
    const { user, rerender } = renderWithProviders(<ExperienceDetailsView {...view} />);
    await user.click(screen.getByRole("button", { name: "Bar ₦16,000.00" }));
    expect(view.onOpenMobileBooking).toHaveBeenCalled();
    rerender(<ExperienceDetailsView {...vm({ mobileBookingOpen: true, onCloseMobileBooking: view.onCloseMobileBooking })} />);
    await user.click(screen.getByRole("button", { name: "Close card" }));
    expect(view.onCloseMobileBooking).toHaveBeenCalled();
  });

  it("shows similar experiences when there are some, and the save modal when open", () => {
    renderWithProviders(
      <ExperienceDetailsView
        {...vm({
          similar: [{ id: "exp-2" } as ExperienceDetailsViewModel["similar"][number]],
          saveModalOpen: true,
        })}
      />,
    );
    expect(screen.getByRole("region", { name: "Similar experiences" })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
