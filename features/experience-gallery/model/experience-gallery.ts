import type { ExperiencePhotoFields } from "./experience-gallery.types";

/** An experience's photos in display order, cover first. Experiences saved
 * before galleries only have a cover. */
export function resolveGalleryImages(experience: ExperiencePhotoFields | null | undefined): string[] {
  const listed = (experience?.images ?? []).filter(Boolean);
  const urls = listed.length ? listed : experience?.cover_image_url ? [experience.cover_image_url] : [];
  return urls.filter((url, index) => urls.indexOf(url) === index);
}
