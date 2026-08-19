"use client";

import {
  CompassIcon,
  ScalesIcon,
  UmbrellaIcon,
  ZapFastIcon,
} from "@/components/icons/onboarding-icons";
import { PillQuestionScreen } from "@/components/onboarding/pill-question-screen";

const options = [
  { id: "relaxed", icon: UmbrellaIcon, label: "Relaxed", description: "Slow starts, easy plans" },
  {
    id: "balanced",
    icon: ScalesIcon,
    label: "Balanced mix",
    description: "A mix of downtime and doing things",
  },
  {
    id: "exploratory",
    icon: CompassIcon,
    label: "Exploratory",
    description: "Discovering new spots as you go",
  },
  {
    id: "packed",
    icon: ZapFastIcon,
    label: "Packed and energetic",
    description: "High energy, back-to-back plans",
  },
];

// Figma: "Desktop - 3"/"Desktop - 4" (2068:25046/2068:25080) / "Step 65"/"Step 66" (2068:25851/2068:25879)
export function PaceContent() {
  return (
    <PillQuestionScreen
      heading="What kind of pace do you enjoy when exploring?"
      subtitle="This helps us match experiences to your vibe."
      options={options}
      continueHref="/onboarding/interests"
      backHref="/onboarding/get-to-know-you"
    />
  );
}
