"use client";

import { CoinsStackedIcon } from "@/components/icons/budget-icons";
import { PillQuestionScreen } from "@/components/onboarding/pill-question-screen";

const options = [
  {
    id: "budget",
    icon: CoinsStackedIcon,
    label: "Budget",
    description: "Simple, but still feels meaningful",
  },
  {
    id: "mid-range",
    icon: CoinsStackedIcon,
    label: "Mid-range",
    description: "Happy to pay more for real quality",
  },
  {
    id: "premium",
    icon: CoinsStackedIcon,
    label: "Premium",
    description: "I want curated, special experiences and don't mind paying more",
  },
  {
    id: "flexible",
    icon: CoinsStackedIcon,
    label: "Flexible",
    description: "It really depends on how good the experience is",
  },
];

// Figma: "Desktop - 8"/"Desktop - 10" (2068:25330/2068:25370) / "Step 82"/"Step 84" (2068:26105/2068:26135)
// Note: the mobile "Step 82" frame's header text was left over from the
// interests screen (a copy-paste slip in the source file) — using the
// correct copy confirmed on its own desktop counterpart instead.
export function BudgetContent() {
  return (
    <PillQuestionScreen
      heading="What's your ideal spend per experience?"
      subtitle="An amount you're comfortable spending per experience"
      options={options}
      maxSelected={1}
      continueHref="/onboarding/vibe"
      backHref="/onboarding/who-with"
    />
  );
}
