import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import type { ExperiencePhotoFields } from "../model/experience-gallery.types";
import { useExperienceGalleryViewModel } from "./use-experience-gallery-view-model";

const FIVE = { images: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"] };

function setup(initialProps: ExperiencePhotoFields | null = FIVE) {
  return renderHookWithProviders(useExperienceGalleryViewModel, { initialProps });
}

describe("useExperienceGalleryViewModel", () => {
  it("starts closed on the first photo", () => {
    const { result } = setup();
    expect(result.current.images).toHaveLength(5);
    expect(result.current.viewerOpen).toBe(false);
    expect(result.current.slideIndex).toBe(0);
  });

  it("opens the viewer on the photo that was picked and closes again", () => {
    const { result } = setup();
    act(() => result.current.onOpenViewer(2));
    expect(result.current.viewerOpen).toBe(true);
    expect(result.current.viewerIndex).toBe(2);
    act(() => result.current.onCloseViewer());
    expect(result.current.viewerOpen).toBe(false);
  });

  it("steps through the photos and wraps at both ends", () => {
    const { result } = setup();
    act(() => result.current.onOpenViewer(4));
    act(() => result.current.onNext());
    expect(result.current.viewerIndex).toBe(0);
    act(() => result.current.onPrevious());
    expect(result.current.viewerIndex).toBe(4);
    act(() => result.current.onPrevious());
    expect(result.current.viewerIndex).toBe(3);
  });

  it("ignores next and previous while the viewer is closed", () => {
    const { result } = setup();
    act(() => result.current.onNext());
    act(() => result.current.onPrevious());
    expect(result.current.viewerOpen).toBe(false);
  });

  it("tracks the photo swiped to in the strip", () => {
    const { result } = setup();
    act(() => result.current.onSlideChange(3));
    expect(result.current.slideIndex).toBe(3);
  });

  it("stays on a photo that exists when the list gets shorter", () => {
    const { result, rerender } = setup();
    act(() => result.current.onOpenViewer(4));
    act(() => result.current.onSlideChange(4));
    rerender({ images: ["1.jpg", "2.jpg"] });
    expect(result.current.viewerIndex).toBe(1);
    expect(result.current.slideIndex).toBe(1);
    act(() => result.current.onNext());
    expect(result.current.viewerIndex).toBe(0);
  });

  it("has nothing to open before the experience loads", () => {
    const { result } = setup(null);
    act(() => result.current.onOpenViewer(0));
    expect(result.current.images).toEqual([]);
    expect(result.current.viewerOpen).toBe(false);
    act(() => result.current.onNext());
    act(() => result.current.onPrevious());
    expect(result.current.viewerIndex).toBe(0);
  });
});
