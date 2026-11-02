import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { experienceContent as content, experienceDetails } from "@/test/fixtures/experience-page";
import { renderWithProviders } from "@/test/utils/render";

import type { ExperiencePageViewModel } from "../view-model/use-experience-page-view-model";
import { ExperiencePageView } from "./experience-page-view";

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav aria-label="Main" /> }));
vi.mock("@/components/home/footer", () => ({ Footer: () => <footer>Footer</footer> }));
vi.mock("@/components/home/experience-rail-section", () => ({
  ExperienceRailSection: ({ heading }: { heading: string }) => <section aria-label={heading} />,
}));
vi.mock("@/components/wishlists/save-to-collection-modal", () => ({
  SaveToCollectionModal: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div role="dialog">Save</div> : null),
}));
vi.mock("@/features/experience-gallery", () => ({ ExperienceGalleryView: () => <div>Gallery</div> }));
vi.mock("@/features/share", () => ({ ShareDialogView: () => null }));
vi.mock("@/features/reviews", () => ({ ExperienceReviewsView: () => <section aria-label="Reviews" /> }));
vi.mock("./experience-sections-view", () => ({ ExperienceSectionsView: () => <div>Sections</div> }));
vi.mock("@/features/booking", () => ({
  BookingBarView: ({ summary, onAction, onExpand }: { summary: string; onAction: () => void; onExpand: () => void }) => (
    <>
      <button onClick={onAction}>Bar {summary}</button>
      <button onClick={onExpand}>Expand bar</button>
    </>
  ),
  BookingPanelView: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid={onClose ? "sheet-card" : "side-card"}>{onClose && <button onClick={onClose}>Close card</button>}</div>
  ),
  ExternalBookingView: () => <aside data-testid="external-card" />,
}));

function vm(overrides: Partial<ExperiencePageViewModel> = {}): ExperiencePageViewModel {
  return {
    status: "ready",
    content,
    gallery: {} as ExperiencePageViewModel["gallery"],
    details: experienceDetails,
    reviews: {} as ExperiencePageViewModel["reviews"],
    externalBooking: null,
    awaitingSession: false,
    booking: {} as ExperiencePageViewModel["booking"],
    bar: { summary: "₦16,000 per person", actionLabel: "Book now" },
    mobileBookingOpen: false,
    onOpenMobileBooking: vi.fn(),
    onBookFromBar: vi.fn(),
    onCloseMobileBooking: vi.fn(),
    saved: false,
    onToggleSave: vi.fn(),
    saveModalOpen: false,
    onCloseSaveModal: vi.fn(),
    onShare: vi.fn(),
    share: { open: false } as never,
    similar: [],
    ...overrides,
  };
}

describe("ExperiencePageView", () => {
  it("shows the title, meta, gallery, sections, booking card and footer", () => {
    renderWithProviders(<ExperiencePageView {...vm()} />);
    expect(screen.getByRole("heading", { level: 1, name: "Sunrise Kayaking" })).toBeInTheDocument();
    expect(screen.getByText("1 hour")).toBeInTheDocument();
    expect(screen.getByText(/4\.0 · Tarkwa Bay, Lagos/)).toBeInTheDocument();
    expect(screen.getByText("Gallery")).toBeInTheDocument();
    expect(screen.getByText("Sections")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByTestId("side-card")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("shows the host's link instead of the booking card and bar for a listing that books elsewhere", () => {
    renderWithProviders(
      <ExperiencePageView {...vm({ externalBooking: { url: "https://host.test", signedIn: true, loginHref: "/login" } })} />,
    );
    expect(screen.getByTestId("external-card")).toBeInTheDocument();
    expect(screen.queryByTestId("side-card")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Bar/ })).not.toBeInTheDocument();
  });

  it("shows neither card until the session is known", () => {
    renderWithProviders(<ExperiencePageView {...vm({ awaitingSession: true })} />);
    expect(screen.queryByTestId("side-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("external-card")).not.toBeInTheDocument();
  });

  it("shows only the location when there is no rating", () => {
    renderWithProviders(<ExperiencePageView {...vm({ content: { ...content, rating: null } })} />);
    expect(screen.getAllByText("Tarkwa Bay, Lagos").length).toBeGreaterThan(0);
    expect(screen.queryByText(/4\.0/)).not.toBeInTheDocument();
  });

  it("shows a skeleton while loading and an error with a way home", () => {
    const { rerender } = renderWithProviders(<ExperiencePageView {...vm({ status: "loading", content: null })} />);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    rerender(<ExperiencePageView {...vm({ status: "error", content: null })} />);
    expect(screen.getByText("Couldn't load this experience")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });

  it("wires wishlist and share", async () => {
    const view = vm();
    const { user } = renderWithProviders(<ExperiencePageView {...view} />);
    await user.click(screen.getByRole("button", { name: "Add to wishlist" }));
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(view.onToggleSave).toHaveBeenCalled();
    expect(view.onShare).toHaveBeenCalled();
  });

  it("starts the booking from the bar's button, expands the sheet from the rest of the bar, and closes it", async () => {
    const view = vm();
    const { user, rerender } = renderWithProviders(<ExperiencePageView {...view} />);
    await user.click(screen.getByRole("button", { name: "Bar ₦16,000 per person" }));
    expect(view.onBookFromBar).toHaveBeenCalled();
    expect(view.onOpenMobileBooking).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Expand bar" }));
    expect(view.onOpenMobileBooking).toHaveBeenCalled();
    rerender(<ExperiencePageView {...vm({ mobileBookingOpen: true, onCloseMobileBooking: view.onCloseMobileBooking })} />);
    await user.click(screen.getByRole("button", { name: "Close card" }));
    expect(view.onCloseMobileBooking).toHaveBeenCalled();
  });

  it("shows similar experiences when there are some, and the save modal when open", () => {
    renderWithProviders(
      <ExperiencePageView
        {...vm({
          similar: [{ id: "exp-2" } as ExperiencePageViewModel["similar"][number]],
          saveModalOpen: true,
        })}
      />,
    );
    expect(screen.getByRole("region", { name: "Similar experiences" })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
