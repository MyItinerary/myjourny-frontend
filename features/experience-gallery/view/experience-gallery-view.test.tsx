import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ExperienceGalleryViewModel } from "../view-model/use-experience-gallery-view-model";
import { ExperienceGalleryView } from "./experience-gallery-view";

const photos = (count: number) => Array.from({ length: count }, (_, i) => `https://img.test/${i + 1}.jpg`);

function viewModel(overrides: Partial<ExperienceGalleryViewModel> = {}): ExperienceGalleryViewModel {
  return {
    images: photos(5),
    slideIndex: 0,
    onSlideChange: vi.fn(),
    viewerOpen: false,
    viewerIndex: 0,
    onOpenViewer: vi.fn(),
    onCloseViewer: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    ...overrides,
  };
}

const grid = () => within(screen.getByTestId("gallery-grid"));
const strip = () => within(screen.getByTestId("gallery-strip"));

describe("ExperienceGalleryView", () => {
  it("shows five placeholder tiles when there are no photos", () => {
    renderWithProviders(<ExperienceGalleryView {...viewModel({ images: [] })} alt="Lagos Food Walk" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByTestId("gallery-grid").children).toHaveLength(6);
    // The View all chip is there, but has nothing to open yet.
    expect(screen.getByRole("button", { name: "View all" })).toBeDisabled();
  });

  it("puts five photos in the grid and the rest behind View all", async () => {
    const vm = viewModel({ images: photos(8) });
    const { user } = renderWithProviders(<ExperienceGalleryView {...vm} alt="Lagos Food Walk" />);
    expect(grid().getAllByRole("img")).toHaveLength(5);
    await user.click(grid().getByRole("button", { name: "View all 8 photos" }));
    expect(vm.onOpenViewer).toHaveBeenCalledWith(0);
  });

  it("opens the viewer on the photo that was clicked", async () => {
    const vm = viewModel();
    const { user } = renderWithProviders(<ExperienceGalleryView {...vm} alt="Lagos Food Walk" />);
    await user.click(grid().getByRole("button", { name: "View photo 3 of 5" }));
    expect(vm.onOpenViewer).toHaveBeenCalledWith(2);
  });

  it("always offers View all, even when every photo fits in the grid", async () => {
    const vm = viewModel({ images: photos(5) });
    const { user } = renderWithProviders(<ExperienceGalleryView {...vm} alt="Lagos Food Walk" />);
    expect(grid().getAllByRole("img")).toHaveLength(5);
    await user.click(grid().getByRole("button", { name: "View all 5 photos" }));
    expect(vm.onOpenViewer).toHaveBeenCalledWith(0);
  });

  it("keeps five tiles with fewer photos, filling the rest with placeholders", () => {
    const { unmount } = renderWithProviders(
      <ExperienceGalleryView {...viewModel({ images: photos(1) })} alt="Lagos Food Walk" />,
    );
    expect(screen.getByTestId("gallery-grid").children).toHaveLength(6);
    expect(grid().getAllByRole("button")).toHaveLength(2);
    expect(strip().queryByText("1 / 1")).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<ExperienceGalleryView {...viewModel({ images: photos(3) })} alt="Lagos Food Walk" />);
    expect(screen.getByTestId("gallery-grid").children).toHaveLength(6);
    expect(grid().getAllByRole("button")).toHaveLength(4);
  });

  it("lets small screens swipe through every photo with a counter", async () => {
    const vm = viewModel({ slideIndex: 1 });
    const { user } = renderWithProviders(<ExperienceGalleryView {...vm} alt="Lagos Food Walk" />);
    expect(strip().getAllByRole("img")).toHaveLength(5);
    expect(strip().getByText("2 / 5")).toBeInTheDocument();

    const scroller = strip().getByRole("button", { name: "View photo 1 of 5" }).parentElement as HTMLElement;
    // jsdom has no layout, so a zero-width strip must not report a slide.
    fireEvent.scroll(scroller);
    expect(vm.onSlideChange).not.toHaveBeenCalled();
    Object.defineProperty(scroller, "clientWidth", { value: 300 });
    scroller.scrollLeft = 610;
    fireEvent.scroll(scroller);
    expect(vm.onSlideChange).toHaveBeenCalledWith(2);

    await user.click(strip().getByRole("button", { name: "View photo 4 of 5" }));
    expect(vm.onOpenViewer).toHaveBeenCalledWith(3);
  });

  it("shows the viewer when it is open", () => {
    renderWithProviders(
      <ExperienceGalleryView {...viewModel({ viewerOpen: true, viewerIndex: 3 })} alt="Lagos Food Walk" />,
    );
    expect(screen.getByRole("dialog", { name: "Photo 4 of 5" })).toBeInTheDocument();
  });
});
