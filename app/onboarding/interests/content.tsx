"use client";

import {
  BuildingIcon,
  CalendarHeartIcon,
  FeatherIcon,
  PaletteIcon,
  SunSettingIcon,
  TranslateIcon,
  UtensilsCrossedIcon,
} from "@/components/icons/interests-icons";
import { PillQuestionScreen } from "@/components/onboarding/pill-question-screen";
import { getPreferences, setPreference } from "@/lib/onboarding/preferences-store";

const options = [
  {
    id: "food",
    icon: UtensilsCrossedIcon,
    label: "Local food & drinks",
    description: "Street eats, cafés, and hidden spots",
  },
  {
    id: "culture",
    icon: TranslateIcon,
    label: "Culture & history",
    description: "Museums, heritage, and local stories",
  },
  {
    id: "nature",
    icon: SunSettingIcon,
    label: "Nature & outdoors",
    description: "Fresh air, trails, and open spaces",
  },
  {
    id: "art",
    icon: PaletteIcon,
    label: "Art & creativity",
    description: "Galleries, murals, and creative spaces",
  },
  {
    id: "wellness",
    icon: FeatherIcon,
    label: "Wellness & calm",
    description: "Spas, quiet spots, and slow moments",
  },
  {
    id: "street-life",
    icon: BuildingIcon,
    label: "Street life",
    description: "Markets, corners, and everyday buzz",
  },
  {
    id: "events",
    icon: CalendarHeartIcon,
    label: "Events & live shows",
    description: "Concerts, festivals, and live energy",
  },
];

// Figma: "Desktop - 5"/"Desktop - 6" (2068:25114/2068:25178) / "Step 79"/"Step 80" (2068:26001/2068:26053)
export function InterestsContent() {
  return (
    <PillQuestionScreen
      heading="What kind of experiences interest you?"
      subtitle="We'll focus on these first. You can select up to 3"
      options={options}
      maxSelected={3}
      continueHref="/onboarding/who-with"
      backHref="/onboarding/pace"
      onContinue={(selected) => setPreference("interests", selected)}
      getInitialSelected={() => getPreferences().interests}
    />
  );
}
