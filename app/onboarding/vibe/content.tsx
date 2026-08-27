"use client";

import {
  FaceContentIcon,
  HeartsIcon,
  LightbulbIcon,
  SearchIcon,
  StarSparkleIcon,
  StarsIcon,
} from "@/components/icons/vibe-icons";
import { PillQuestionScreen } from "@/components/onboarding/pill-question-screen";
import { setPreference } from "@/lib/onboarding/preferences-store";

const options = [
  {
    id: "escape",
    icon: FaceContentIcon,
    label: "Escape & reset",
    description: "Simple, but still feels meaningful",
  },
  {
    id: "learn",
    icon: LightbulbIcon,
    label: "Learn something new",
    description: "Happy to pay more for real quality",
  },
  {
    id: "adventure",
    icon: StarsIcon,
    label: "Adventure & novelty",
    description: "New, exciting, and a little wild",
  },
  {
    id: "romance",
    icon: HeartsIcon,
    label: "Romance & connection",
    description: "To deepen or spark a connection",
  },
  {
    id: "celebrate",
    icon: StarSparkleIcon,
    label: "Celebrate something",
    description: "To celebrate milestones and wins",
  },
  {
    id: "local-scene",
    icon: SearchIcon,
    label: "Explore the local scene",
    description: "To see how locals live, eat, play",
  },
];

// Figma: "Desktop - 11"/"Desktop - 12" (2068:25410/2068:25450) / "Step 85"/"Step 86" (2068:26165/2068:26199)
export function VibeContent() {
  return (
    <PillQuestionScreen
      heading="What kind of experiences light you up?"
      subtitle="Everyone shows up for different reasons. This helps us recommend better."
      options={options}
      continueHref="/onboarding/curating"
      backHref="/onboarding/budget"
      onContinue={(selected) => setPreference("tripIntent", selected)}
    />
  );
}
