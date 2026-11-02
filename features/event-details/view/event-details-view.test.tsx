import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { SAMPLE_EVENT } from "@/test/fixtures/event-details";
import type { EventDetailsViewModel } from "../view-model/use-event-details-view-model";
import { EventDetailsView } from "./event-details-view";

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav aria-label="Main" /> }));
vi.mock("@/components/home/footer", () => ({ Footer: () => <footer>Footer</footer> }));
vi.mock("@/components/home/experience-rail-section", () => ({
  ExperienceRailSection: ({ heading }: { heading: string }) => <section aria-label={heading} />,
}));
vi.mock("@/features/experience-gallery", () => ({ ExperienceGalleryView: () => <div>Gallery</div> }));
vi.mock("@/features/share", () => ({ ShareDialogView: () => null }));
vi.mock("@/features/booking", () => ({
  BookingBarView: ({ summary, detail, actionLabel, onAction, onExpand }: Record<string, string & (() => void)>) => (
    <>
      <button onClick={onAction}>
        {actionLabel} | {summary} | {detail}
      </button>
      <button onClick={onExpand}>Expand bar</button>
    </>
  ),
  EventBookingCardView: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid={onClose ? "sheet-card" : "side-card"}>{onClose && <button onClick={onClose}>Close card</button>}</div>
  ),
}));

function vm(overrides: Partial<EventDetailsViewModel> = {}): EventDetailsViewModel {
  return {
    status: "ready",
    event: SAMPLE_EVENT,
    gallery: {} as EventDetailsViewModel["gallery"],
    booking: {} as EventDetailsViewModel["booking"],
    bar: { summary: "From ₦10,000 per ticket", detail: "Sat 14 Nov · Doors 8:30am", actionLabel: "Get tickets" },
    openQuestionId: null,
    onToggleQuestion: vi.fn(),
    mobileBookingOpen: false,
    onOpenMobileBooking: vi.fn(),
    onBookFromBar: vi.fn(),
    onCloseMobileBooking: vi.fn(),
    saved: false,
    onToggleSave: vi.fn(),
    onShare: vi.fn(),
    share: { open: false } as never,
    similar: [],
    ...overrides,
  };
}

describe("EventDetailsView", () => {
  it("shows the title, when and where, the sections, the past events and the ticket card", () => {
    renderWithProviders(<EventDetailsView {...vm()} />);
    expect(screen.getByRole("heading", { level: 1, name: "Afro Futures Summit" })).toBeInTheDocument();
    expect(screen.getByText("Sat, 14 Nov 2026")).toBeInTheDocument();
    expect(screen.getByText("9:00AM to 5:00PM")).toBeInTheDocument();
    expect(screen.getByText("Harbour Hall, Victoria Island, Lagos.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About this event" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Past events by this host" })).toBeInTheDocument();
    expect(screen.getByTestId("side-card")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("shows placeholder photos until the event has some, then the gallery", () => {
    const { rerender } = renderWithProviders(<EventDetailsView {...vm()} />);
    expect(screen.getByTestId("event-photo-placeholders")).toBeInTheDocument();
    rerender(<EventDetailsView {...vm({ event: { ...SAMPLE_EVENT, images: ["https://img.test/1.jpg"] } })} />);
    expect(screen.getByText("Gallery")).toBeInTheDocument();
    expect(screen.queryByTestId("event-photo-placeholders")).not.toBeInTheDocument();
  });

  it("shows a skeleton while loading and an error with a way home", () => {
    const { rerender } = renderWithProviders(<EventDetailsView {...vm({ status: "loading", event: null })} />);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    rerender(<EventDetailsView {...vm({ status: "error", event: null })} />);
    expect(screen.getByText("Couldn't load this event")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });

  it("wires wishlist and share", async () => {
    const view = vm();
    const { user } = renderWithProviders(<EventDetailsView {...view} />);
    await user.click(screen.getByRole("button", { name: "Add to wishlist" }));
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(view.onToggleSave).toHaveBeenCalled();
    expect(view.onShare).toHaveBeenCalled();
  });

  it("gets tickets from the bar's button, expands the sheet from the rest of the bar, and closes it", async () => {
    const view = vm();
    const { user, rerender } = renderWithProviders(<EventDetailsView {...view} />);
    await user.click(screen.getByRole("button", { name: /Get tickets \| From ₦10,000 per ticket \| Sat 14 Nov/ }));
    expect(view.onBookFromBar).toHaveBeenCalled();
    expect(view.onOpenMobileBooking).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Expand bar" }));
    expect(view.onOpenMobileBooking).toHaveBeenCalled();
    rerender(<EventDetailsView {...vm({ mobileBookingOpen: true, onCloseMobileBooking: view.onCloseMobileBooking })} />);
    await user.click(screen.getByRole("button", { name: "Close card" }));
    expect(view.onCloseMobileBooking).toHaveBeenCalled();
  });

  it("shows similar events when there are some", () => {
    renderWithProviders(
      <EventDetailsView {...vm({ similar: [{ id: "ev-2" } as EventDetailsViewModel["similar"][number]] })} />,
    );
    expect(screen.getByRole("region", { name: "Similar events" })).toBeInTheDocument();
  });
});
