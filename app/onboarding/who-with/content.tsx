"use client";

import {
  UserSoloIcon,
  UsersBigGroupIcon,
  UsersSmallGroupIcon,
  UsersTwoIcon,
} from "@/components/icons/who-with-icons";
import { PillQuestionScreen } from "@/components/onboarding/pill-question-screen";

const options = [
  {
    id: "solo",
    icon: UserSoloIcon,
    label: "Solo, at my own pace",
    description: "Just me, moving how I want",
  },
  {
    id: "partner",
    icon: UsersTwoIcon,
    label: "With a partner",
    description: "Sharing the moment, just us two",
  },
  {
    id: "small-group",
    icon: UsersSmallGroupIcon,
    label: "Small group (2–4 people)",
    description: "A tight crew, easy and close",
  },
  {
    id: "big-group",
    icon: UsersBigGroupIcon,
    label: "Big group energy",
    description: "The more the merrier",
  },
  {
    id: "low-interaction",
    icon: UserSoloIcon,
    label: "Low-interaction, minimal crowds",
    description: "Depends on how good it is",
  },
];

// Figma: "Desktop - 7"/"Desktop - 9" (2068:25242/2068:25286) / "Step 68"/"Step 83" (2068:26233/2068:26263)
export function WhoWithContent() {
  return (
    <PillQuestionScreen
      heading="Who do you usually go with?"
      subtitle="We'll focus on these first. You can select up to 3"
      options={options}
      maxSelected={3}
      continueHref="/onboarding/budget"
      backHref="/onboarding/interests"
    />
  );
}
