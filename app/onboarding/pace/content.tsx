"use client";

import {
  CompassIcon,
  ScalesIcon,
  UmbrellaIcon,
  ZapFastIcon,
} from "@/components/icons/onboarding-icons";
import { PillQuestionScreen, type PillOption } from "@/components/onboarding/pill-question-screen";
import { useCategories, type Category } from "@/lib/queries/categories";
import { setPreference } from "@/lib/onboarding/preferences-store";

// Keyed by itin's energy_level category slugs — icon/label/description stay
// exactly as pixel-verified; only the id (now a real backend slug, not an
// arbitrary local one) changed. "Exploratory" is a newer category
// (itin#41) sitting between balanced and high.
const ENERGY_METADATA: Record<string, { icon: typeof UmbrellaIcon; label: string; description: string }> = {
  chill: { icon: UmbrellaIcon, label: "Relaxed", description: "Slow starts, easy plans" },
  balanced: { icon: ScalesIcon, label: "Balanced mix", description: "A mix of downtime and doing things" },
  exploratory: { icon: CompassIcon, label: "Exploratory", description: "Discovering new spots as you go" },
  high: { icon: ZapFastIcon, label: "Packed and energetic", description: "High energy, back-to-back plans" },
};

const ENERGY_FALLBACK: Category[] = [
  { id: -1, parent_id: null, slug: "chill", text: "Chill", weight: 0, category_type: "energy_level", is_active: true },
  { id: -2, parent_id: null, slug: "balanced", text: "Balanced", weight: 1, category_type: "energy_level", is_active: true },
  { id: -3, parent_id: null, slug: "exploratory", text: "Exploratory", weight: 1.5, category_type: "energy_level", is_active: true },
  { id: -4, parent_id: null, slug: "high", text: "High", weight: 2, category_type: "energy_level", is_active: true },
];

// Figma: "Desktop - 3"/"Desktop - 4" (2068:25046/2068:25080) / "Step 65"/"Step 66" (2068:25851/2068:25879)
export function PaceContent() {
  const { data: categories } = useCategories("energy_level", ENERGY_FALLBACK);

  const options: PillOption[] = categories
    .map((category): PillOption | null => {
      const meta = ENERGY_METADATA[category.slug];
      // A category itin adds later that this screen doesn't know how to
      // decorate (icon/copy) yet — skip it rather than render undecorated.
      if (!meta) return null;
      return { id: category.slug, icon: meta.icon, label: meta.label, description: meta.description };
    })
    .filter((option): option is PillOption => option !== null);

  return (
    <PillQuestionScreen
      heading="What kind of pace do you enjoy when exploring?"
      subtitle="This helps us match experiences to your vibe."
      options={options}
      continueHref="/onboarding/interests"
      backHref="/onboarding/get-to-know-you"
      onContinue={(selected) => setPreference("energyLevel", selected[0])}
    />
  );
}
