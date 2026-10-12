import { useCallback, useMemo, useState } from "react";

import { resolveGalleryImages } from "../model/experience-gallery";
import type { ExperiencePhotoFields } from "../model/experience-gallery.types";

export type ExperienceGalleryViewModel = {
  images: string[];
  /** The photo showing in the swipeable strip on small screens. */
  slideIndex: number;
  onSlideChange: (index: number) => void;
  viewerOpen: boolean;
  /** The photo showing in the full-screen viewer. */
  viewerIndex: number;
  onOpenViewer: (index: number) => void;
  onCloseViewer: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

/** State for an experience's photo gallery and its full-screen viewer. */
export function useExperienceGalleryViewModel(
  experience: ExperiencePhotoFields | null | undefined,
): ExperienceGalleryViewModel {
  const images = useMemo(() => resolveGalleryImages(experience), [experience]);
  const count = images.length;
  const [slide, setSlide] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  // The list can shrink under an open gallery when the page moves to another experience.
  const clamp = (index: number) => Math.min(Math.max(index, 0), Math.max(count - 1, 0));

  const onOpenViewer = useCallback((index: number) => setViewer(index), []);
  const onCloseViewer = useCallback(() => setViewer(null), []);
  const onNext = useCallback(
    () => setViewer((index) => (index === null || count === 0 ? index : (Math.min(index, count - 1) + 1) % count)),
    [count],
  );
  const onPrevious = useCallback(
    () =>
      setViewer((index) => (index === null || count === 0 ? index : (Math.min(index, count - 1) - 1 + count) % count)),
    [count],
  );

  return {
    images,
    slideIndex: clamp(slide),
    onSlideChange: setSlide,
    viewerOpen: viewer !== null && count > 0,
    viewerIndex: clamp(viewer ?? 0),
    onOpenViewer,
    onCloseViewer,
    onNext,
    onPrevious,
  };
}
