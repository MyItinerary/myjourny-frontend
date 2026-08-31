"use client";

import { CoinsStackedIcon } from "@/components/icons/budget-icons";
import { PillQuestionScreen, type PillOption } from "@/components/onboarding/pill-question-screen";
import { useCategories, type Category } from "@/lib/queries/categories";
import { getPreferences, setPreference } from "@/lib/onboarding/preferences-store";

// Keyed by itin's budget_level category slugs. "Flexible" is a newer
// category (itin#41) — it's now a real saved value, not the omit-the-field
// special case other MyJourny clients (mobile-app) use.
const BUDGET_METADATA: Record<string, { label: string; description: string }> = {
  low: { label: "Budget", description: "Simple, but still feels meaningful" },
  medium: { label: "Mid-range", description: "Happy to pay more for real quality" },
  high: {
    label: "Premium",
    description: "I want curated, special experiences and don't mind paying more",
  },
  flexible: { label: "Flexible", description: "It really depends on how good the experience is" },
};

const BUDGET_FALLBACK: Category[] = [
  { id: -1, parent_id: null, slug: "low", text: "Low", weight: 0, category_type: "budget_level", is_active: true },
  { id: -2, parent_id: null, slug: "medium", text: "Medium", weight: 1, category_type: "budget_level", is_active: true },
  { id: -3, parent_id: null, slug: "high", text: "High", weight: 2, category_type: "budget_level", is_active: true },
  { id: -4, parent_id: null, slug: "flexible", text: "Flexible", weight: 3, category_type: "budget_level", is_active: true },
];

// Figma: "Desktop - 8"/"Desktop - 10" (2068:25330/2068:25370) / "Step 82"/"Step 84" (2068:26105/2068:26135)
// Note: the mobile "Step 82" frame's header text was left over from the
// interests screen (a copy-paste slip in the source file) — using the
// correct copy confirmed on its own desktop counterpart instead.
export function BudgetContent() {
  const { data: categories } = useCategories("budget_level", BUDGET_FALLBACK);

  const options: PillOption[] = categories
    .map((category): PillOption | null => {
      const meta = BUDGET_METADATA[category.slug];
      if (!meta) return null;
      return { id: category.slug, icon: CoinsStackedIcon, label: meta.label, description: meta.description };
    })
    .filter((option): option is PillOption => option !== null);

  return (
    <PillQuestionScreen
      heading="What's your ideal spend per experience?"
      subtitle="An amount you're comfortable spending per experience"
      options={options}
      maxSelected={1}
      continueHref="/onboarding/vibe"
      backHref="/onboarding/who-with"
      logoGap="152.8px"
      onContinue={(selected) => setPreference("budgetRange", selected[0])}
      getInitialSelected={() => {
        const value = getPreferences().budgetRange;
        return value ? [value] : undefined;
      }}
    />
  );
}
