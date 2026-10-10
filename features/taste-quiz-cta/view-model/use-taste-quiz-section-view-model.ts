import { driftCopy } from "../model/drift-copy";
import { useTasteDrift } from "../model/taste-drift";
import { useTasteQuizAudience } from "../model/visibility";
import { GUEST_HREF, QUIZ_HREF } from "./use-taste-quiz-cta-view-model";

export type TasteQuizSectionViewModel = {
  visible: boolean;
  href: string;
  /** Set for the "taste has drifted" variant; the view falls back to the first-time copy. */
  title?: string;
  body?: string;
  ctaLabel?: string;
};

/** The home-page section: the first-time pitch for guests and users who
 * haven't taken the quiz, and "your taste has drifted" for users who have but
 * whose bookings have moved on from their answers. */
export function useTasteQuizSectionViewModel(): TasteQuizSectionViewModel {
  const audience = useTasteQuizAudience();
  const drift = useTasteDrift(audience === "taken");

  if (audience === "guest") return { visible: true, href: GUEST_HREF };
  if (audience === "no-quiz") return { visible: true, href: QUIZ_HREF };
  if (audience === "taken" && drift) return { visible: true, href: QUIZ_HREF, ...driftCopy(drift) };
  return { visible: false, href: QUIZ_HREF };
}
