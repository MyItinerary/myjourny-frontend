import { useGetProfile } from "@/lib/queries/profile";
import { useSession } from "@/lib/auth/session-store";

/** "taken" is a signed-in user who finished the quiz; "hidden" is anyone we
 * can't classify yet. */
export type TasteQuizCtaAudience = "guest" | "no-quiz" | "taken" | "hidden";

/** Who the taste-quiz card is for: guests without an account, and signed-in
 * users whose profile isn't marked `completed` (the flag the quiz sets when
 * it saves). Users who finished the quiz are "taken"; anyone we can't classify
 * yet is "hidden", so the card never flashes in and out while the session or
 * profile loads. */
export function tasteQuizAudience({
  hydrated,
  signedIn,
  profileCompleted,
}: {
  hydrated: boolean;
  signedIn: boolean;
  /** undefined while the profile is still loading or failed to load. */
  profileCompleted: boolean | undefined;
}): TasteQuizCtaAudience {
  if (!hydrated) return "hidden";
  if (!signedIn) return "guest";
  if (profileCompleted === undefined) return "hidden";
  return profileCompleted ? "taken" : "no-quiz";
}

export function useTasteQuizAudience(): TasteQuizCtaAudience {
  const { user, hydrated } = useSession();
  const profile = useGetProfile();
  return tasteQuizAudience({
    hydrated,
    signedIn: user !== null,
    profileCompleted: profile.data ? Boolean(profile.data.completed) : undefined,
  });
}
