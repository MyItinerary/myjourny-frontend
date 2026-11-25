import { useCallback, useEffect, useState } from "react";

import { HOME_SECTION_IDS } from "../model/home-sections.types";

/** How long someone has to sit still on the page before the popup is offered. */
export const POPUP_IDLE_MS = 8000;
export const POPUP_DISMISSED_KEY = "myjourny:taste-quiz-popup-dismissed";

const ACTIVITY_EVENTS = ["scroll", "wheel", "mousemove", "mousedown", "keydown", "touchstart"] as const;

export type TasteQuizPopupViewModel = {
  visible: boolean;
  href: string;
  /** "Maybe later": closes it for the rest of the visit. */
  onDismiss: () => void;
};

function readDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(POPUP_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Between the end of "Why book with us" (scrolled past) and the newsletter (not reached yet). */
function inOfferZone(): boolean {
  const whyBook = document.getElementById(HOME_SECTION_IDS.whyBook);
  const newsletter = document.getElementById(HOME_SECTION_IDS.newsletter);
  if (!whyBook || !newsletter) return false;
  return whyBook.getBoundingClientRect().bottom <= 0 && newsletter.getBoundingClientRect().top >= window.innerHeight;
}

/** The "match your taste" popup. It isn't there all the time: it's offered when someone has sat
 * still on the home page for a while (no scrolling, moving the mouse, clicking or typing), but only
 * in the part of the page after "Why book with us" and before the newsletter. Once offered it
 * stays while they're in that part of the page, until they dismiss it; "Maybe later" keeps it
 * away for the rest of the visit. */
export function useTasteQuizPopupViewModel({ visible, href }: { visible: boolean; href: string }): TasteQuizPopupViewModel {
  const [offered, setOffered] = useState(false);
  const [inZone, setInZone] = useState(false);
  // Not shown before the idle wait, so reading storage on the client can't cause a mismatch.
  const [dismissed, setDismissed] = useState(() => typeof window !== "undefined" && readDismissed());

  useEffect(() => {
    if (!visible || dismissed) return;
    let timer: ReturnType<typeof setTimeout>;

    function startIdleWait() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (inOfferZone()) {
          setInZone(true);
          setOffered(true);
        }
      }, POPUP_IDLE_MS);
    }

    function handleActivity() {
      setInZone(inOfferZone());
      startIdleWait();
    }

    startIdleWait();
    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, handleActivity, { passive: true });
    return () => {
      clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, handleActivity);
    };
  }, [visible, dismissed]);

  const onDismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(POPUP_DISMISSED_KEY, "1");
    } catch {
      // Private mode or blocked storage: it just comes back next visit.
    }
  }, []);

  return { visible: visible && offered && inZone && !dismissed, href, onDismiss };
}
