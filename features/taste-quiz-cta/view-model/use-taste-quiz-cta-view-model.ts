import { useTasteQuizAudience } from "../model/visibility";

export type TasteQuizCtaViewModel = {
  visible: boolean;
  href: string;
};

// Guests have to create an account first (the quiz saves to a profile), so
// they start at the sign-up splash, which leads into the quiz. Signed-in
// users skip straight to the quiz's first screen.
const GUEST_HREF = "/onboarding";
const SIGNED_IN_HREF = "/onboarding/get-to-know-you";

export function useTasteQuizCtaViewModel(): TasteQuizCtaViewModel {
  const audience = useTasteQuizAudience();
  return {
    visible: audience !== "hidden",
    href: audience === "no-quiz" ? SIGNED_IN_HREF : GUEST_HREF,
  };
}
