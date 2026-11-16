import { useEffect, useState } from "react";

import { setActivePreview, stripPreviewHash, takePreviewToken } from "@/lib/experience-preview";

import { type ExperiencePageViewModel, useExperiencePageViewModel } from "./use-experience-page-view-model";

/**
 * The preview page: the experience page for a listing that may not be live,
 * opened from Helm or the host dashboard with a token in the link. Without a
 * valid token itin answers 404 and the page says the link has expired.
 */
export function useExperiencePreviewViewModel(id: string): ExperiencePageViewModel {
  // Read during the first render so the token is in place before the first request.
  const [token] = useState(() => (typeof window === "undefined" ? null : takePreviewToken(id)));
  if (token) setActivePreview({ id, token });

  useEffect(() => {
    // Set again here too: Strict Mode runs the cleanup once before the real mount.
    if (token) setActivePreview({ id, token });
    stripPreviewHash();
    return () => setActivePreview(null);
  }, [id, token]);

  return useExperiencePageViewModel(id, { preview: true });
}
