import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { GalleryViewerView, type GalleryViewerProps } from "./gallery-viewer-view";

const IMAGES = ["https://img.test/1.jpg", "https://img.test/2.jpg", "https://img.test/3.jpg"];

function props(overrides: Partial<GalleryViewerProps> = {}): GalleryViewerProps {
  return {
    open: true,
    images: IMAGES,
    index: 1,
    alt: "Lagos Food Walk",
    onClose: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    ...overrides,
  };
}

describe("GalleryViewerView", () => {
  it("shows nothing while closed", () => {
    renderWithProviders(<GalleryViewerView {...props({ open: false })} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the current photo and where it is in the set", () => {
    renderWithProviders(<GalleryViewerView {...props()} />);
    expect(screen.getByRole("dialog", { name: "Photo 2 of 3" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Lagos Food Walk, photo 2 of 3" })).toHaveAttribute("src", IMAGES[1]);
  });

  it("steps with the buttons and the arrow keys", async () => {
    const p = props();
    const { user } = renderWithProviders(<GalleryViewerView {...p} />);
    await user.click(screen.getByRole("button", { name: "Next photo" }));
    await user.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(p.onNext).toHaveBeenCalledTimes(1);
    expect(p.onPrevious).toHaveBeenCalledTimes(1);
    await user.keyboard("{ArrowRight}{ArrowLeft}{ArrowLeft}");
    expect(p.onNext).toHaveBeenCalledTimes(2);
    expect(p.onPrevious).toHaveBeenCalledTimes(3);
  });

  it("closes from the close button and with Escape", async () => {
    const p = props();
    const { user } = renderWithProviders(<GalleryViewerView {...p} />);
    await user.click(screen.getByRole("button", { name: "Close photos" }));
    expect(p.onClose).toHaveBeenCalledTimes(1);
    await user.keyboard("{Escape}");
    expect(p.onClose).toHaveBeenCalledTimes(2);
  });

  it("has no arrows for a single photo", () => {
    renderWithProviders(<GalleryViewerView {...props({ images: IMAGES.slice(0, 1), index: 0 })} />);
    expect(screen.queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous photo" })).not.toBeInTheDocument();
  });
});
