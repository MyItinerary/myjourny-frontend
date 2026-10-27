import { screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import {
  DetailActions,
  DetailBreadcrumbs,
  DetailExpandableText,
  DetailFact,
  DetailHostStrip,
  DetailMapPlaceholder,
  DetailSection,
} from "./detail-page-parts";

describe("detail page parts", () => {
  it("links every breadcrumb but the current page", () => {
    renderWithProviders(<DetailBreadcrumbs items={[{ label: "Home page", href: "/" }, { label: "Kayaking" }]} />);
    expect(screen.getByRole("link", { name: "Home page" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Kayaking")).toHaveAttribute("aria-current", "page");
  });

  it("titles a section", () => {
    renderWithProviders(
      <DetailSection title="Itinerary">
        <p>Steps</p>
      </DetailSection>,
    );
    expect(screen.getByRole("heading", { name: "Itinerary", level: 2 })).toBeInTheDocument();
  });

  it("sets section titles at 20px, and the lead section at 24px", () => {
    renderWithProviders(
      <>
        <DetailSection title="Itinerary">
          <p>Steps</p>
        </DetailSection>
        <DetailSection title="About this event" size="md">
          <p>Text</p>
        </DetailSection>
      </>,
    );
    expect(screen.getByRole("heading", { name: "Itinerary" })).toHaveClass("text-xl");
    expect(screen.getByRole("heading", { name: "About this event" })).toHaveClass("text-2xl");
  });

  it("folds long text behind Show more", async () => {
    const { user } = renderWithProviders(<DetailExpandableText text={"word ".repeat(100)} limit={50} />);
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show less" }));
    expect(screen.getByRole("button", { name: "Show more" })).toBeInTheDocument();
  });

  it("does not offer Show more for short text", () => {
    renderWithProviders(<DetailExpandableText text="Short." />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows a fact", () => {
    renderWithProviders(<DetailFact icon={Users} title="Group size" body="Up to 8 guests" />);
    expect(screen.getByText("Group size")).toBeInTheDocument();
    expect(screen.getByText("Up to 8 guests")).toBeInTheDocument();
  });

  it("shows the host with a link, a verified badge and the place", () => {
    renderWithProviders(
      <DetailHostStrip
        name="Kayak Thrills"
        href="/guides/1"
        verified
        blurb="Verified guide"
        placeName="Victoria Island"
        placeDetail="Lagos"
      />,
    );
    expect(screen.getByRole("link", { name: "Kayak Thrills" })).toHaveAttribute("href", "/guides/1");
    expect(screen.getByLabelText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Victoria Island")).toBeInTheDocument();
  });

  it("labels the map pin", () => {
    renderWithProviders(<DetailMapPlaceholder label="Tarkwa Bay, Lagos" />);
    expect(screen.getByText("Tarkwa Bay, Lagos")).toBeInTheDocument();
  });

  it("toggles the wishlist and shares", async () => {
    const onToggleSave = vi.fn();
    const onShare = vi.fn();
    const { user, rerender } = renderWithProviders(<DetailActions saved={false} onToggleSave={onToggleSave} onShare={onShare} />);
    await user.click(screen.getByRole("button", { name: "Add to wishlist" }));
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(onToggleSave).toHaveBeenCalled();
    expect(onShare).toHaveBeenCalled();
    rerender(<DetailActions saved onToggleSave={onToggleSave} onShare={onShare} />);
    expect(screen.getByRole("button", { name: "Saved" })).toBeInTheDocument();
  });
});
