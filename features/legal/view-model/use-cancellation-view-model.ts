import { useCallback, useEffect, useState } from "react";

import { cancellationData } from "../model/cancellation-data";
import type { TermsData } from "../model/terms.types";

export interface CancellationViewModel {
  data: TermsData;
  activeSectionId: string;
  backHref: string;
  backLabel: string;
  onSectionSelect: (id: string) => void;
}

export function useCancellationViewModel(): CancellationViewModel {
  const [activeSectionId, setActiveSectionId] = useState<string>("short-version");

  const onSectionSelect = useCallback((id: string) => {
    setActiveSectionId(id);
    if (typeof document !== "undefined") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sectionIds = cancellationData.tableOfContents
      .filter((item) => !item.isPartHeading)
      .map((item) => item.id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) =>
            curr.boundingClientRect.top < prev.boundingClientRect.top ? curr : prev
          );
          setActiveSectionId(topEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  return {
    data: cancellationData,
    activeSectionId,
    backHref: "/legal",
    backLabel: "All legal documents",
    onSectionSelect,
  };
}
