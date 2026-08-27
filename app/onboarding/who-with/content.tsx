"use client";

import {
  UserSoloIcon,
  UsersBigGroupIcon,
  UsersSmallGroupIcon,
  UsersTwoIcon,
} from "@/components/icons/who-with-icons";
import { PillQuestionScreen, type PillOption } from "@/components/onboarding/pill-question-screen";
import { useCategories, type Category } from "@/lib/queries/categories";
import { getPreferences, setPreference } from "@/lib/onboarding/preferences-store";

// Keyed by itin's social_style category slugs. Important: `open` already
// means "Big group energy" in production (mobile-app + helm both use it
// that way for real records) — verified before wiring this, since the
// obvious-looking id would have been wrong. "Low-interaction, minimal
// crowds" gets its own newer category, low_interaction (itin#41), rather
// than reusing open or solo.
const SOCIAL_METADATA: Record<string, { icon: typeof UserSoloIcon; label: string; description: string }> = {
  solo: { icon: UserSoloIcon, label: "Solo, at my own pace", description: "Just me, moving how I want" },
  couple: { icon: UsersTwoIcon, label: "With a partner", description: "Sharing the moment, just us two" },
  group: { icon: UsersSmallGroupIcon, label: "Small group (2–4 people)", description: "A tight crew, easy and close" },
  open: { icon: UsersBigGroupIcon, label: "Big group energy", description: "The more the merrier" },
  low_interaction: {
    icon: UserSoloIcon,
    label: "Low-interaction, minimal crowds",
    description: "Depends on how good it is",
  },
};

const SOCIAL_FALLBACK: Category[] = [
  { id: -1, parent_id: null, slug: "solo", text: "Solo", weight: 0, category_type: "social_style", is_active: true },
  { id: -2, parent_id: null, slug: "couple", text: "Couple", weight: 1, category_type: "social_style", is_active: true },
  { id: -3, parent_id: null, slug: "group", text: "Group", weight: 2, category_type: "social_style", is_active: true },
  { id: -4, parent_id: null, slug: "open", text: "Open", weight: 3, category_type: "social_style", is_active: true },
  { id: -5, parent_id: null, slug: "low_interaction", text: "Low interaction", weight: 4, category_type: "social_style", is_active: true },
];

// Figma: "Desktop - 7"/"Desktop - 9" (2068:25242/2068:25286) / "Step 68"/"Step 83" (2068:26233/2068:26263)
export function WhoWithContent() {
  const { data: categories } = useCategories("social_style", SOCIAL_FALLBACK);

  const options: PillOption[] = categories
    .map((category): PillOption | null => {
      const meta = SOCIAL_METADATA[category.slug];
      if (!meta) return null;
      return { id: category.slug, icon: meta.icon, label: meta.label, description: meta.description };
    })
    .filter((option): option is PillOption => option !== null);

  return (
    <PillQuestionScreen
      heading="Who do you usually go with?"
      subtitle="We'll focus on these first. You can select up to 3"
      options={options}
      maxSelected={3}
      continueHref="/onboarding/budget"
      backHref="/onboarding/interests"
      onContinue={(selected) => setPreference("socialStyle", selected[0])}
      getInitialSelected={() => {
        const value = getPreferences().socialStyle;
        return value ? [value] : undefined;
      }}
    />
  );
}
