import { useTasteQuizAudience } from "../model/visibility";

export type TasteQuizCtaViewModel = {
  visible: boolean;
  href: string;
};

// Guests have to create an account first (the quiz saves to a profile), so
// they start at the sign-up splash, which leads into the quiz. Signed-in
// users skip straight to the quiz's first screen.
export const GUEST_HREF = "/onboarding";
export const QUIZ_HREF = "/onboarding/get-to-know-you";

/** The banner for people who haven't taken the quiz: guests and signed-in
 * users without a finished profile. */
export function useTasteQuizCtaViewModel(): TasteQuizCtaViewModel {
  const audience = useTasteQuizAudience();
  return {
    visible: audience === "guest" || audience === "no-quiz",
    href: audience === "no-quiz" ? QUIZ_HREF : GUEST_HREF,
  };
}
