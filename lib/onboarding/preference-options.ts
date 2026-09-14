import {
  BuildingIcon,
  CalendarHeartIcon,
  FeatherIcon,
  PaletteIcon,
  SunSettingIcon,
  TranslateIcon,
  UtensilsCrossedIcon,
} from "@/components/icons/interests-icons";
import {
  CompassIcon,
  ScalesIcon,
  UmbrellaIcon,
  ZapFastIcon,
} from "@/components/icons/onboarding-icons";
import {
  FaceContentIcon,
  HeartsIcon,
  LightbulbIcon,
  SearchIcon,
  StarSparkleIcon,
  StarsIcon,
} from "@/components/icons/vibe-icons";
import {
  UserSoloIcon,
  UsersBigGroupIcon,
  UsersSmallGroupIcon,
  UsersTwoIcon,
} from "@/components/icons/who-with-icons";
import { CoinsStackedIcon } from "@/components/icons/budget-icons";
import type { ComponentType, SVGProps } from "react";

export interface PreferenceOption {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
}

export const INTEREST_OPTIONS: PreferenceOption[] = [
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

export const ENERGY_OPTIONS: PreferenceOption[] = [
  {
    id: "chill",
    icon: UmbrellaIcon,
    label: "Relaxed",
    description: "Slow starts, easy plans",
  },
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
    id: "high",
    icon: ZapFastIcon,
    label: "Packed and energetic",
    description: "High energy, back-to-back plans",
  },
];

export const VIBE_OPTIONS: PreferenceOption[] = [
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

export const SOCIAL_OPTIONS: PreferenceOption[] = [
  {
    id: "solo",
    icon: UserSoloIcon,
    label: "Solo, at my own pace",
    description: "Just me, moving how I want",
  },
  {
    id: "couple",
    icon: UsersTwoIcon,
    label: "With a partner",
    description: "Sharing the moment, just us two",
  },
  {
    id: "group",
    icon: UsersSmallGroupIcon,
    label: "Small group (2–4 people)",
    description: "A tight crew, easy and close",
  },
  {
    id: "open",
    icon: UsersBigGroupIcon,
    label: "Big group energy",
    description: "The more the merrier",
  },
  {
    id: "low_interaction",
    icon: UserSoloIcon,
    label: "Low-interaction, minimal crowds",
    description: "Depends on how good it is",
  },
];

export const BUDGET_OPTIONS: PreferenceOption[] = [
  {
    id: "low",
    icon: CoinsStackedIcon,
    label: "Low",
    description: "I prefer simple experiences that still feel meaningful",
  },
  {
    id: "medium",
    icon: CoinsStackedIcon,
    label: "Medium",
    description: "I'm happy to pay for quality if it's worth it",
  },
  {
    id: "high",
    icon: CoinsStackedIcon,
    label: "High",
    description: "I want curated, special experiences and don't mind paying more",
  },
  {
    id: "flexible",
    icon: CoinsStackedIcon,
    label: "Flexible",
    description: "It really depends on how good the experience is",
  },
];

export function getInterestsSummary(ids?: string[]): string {
  if (!ids || ids.length === 0) return "Escape & reset, Adventure…";
  const labels = ids.map((id) => {
    const found = INTEREST_OPTIONS.find((opt) => opt.id === id);
    return found ? found.label : id;
  });
  return labels.join(", ");
}

export function getEnergySummary(id?: string): string {
  if (!id) return "Packed & energetic";
  const found = ENERGY_OPTIONS.find((opt) => opt.id === id);
  return found ? found.label : id;
}

export function getVibeSummary(ids?: string[]): string {
  if (!ids || ids.length === 0) return "Local food & drinks, Nature…";
  const labels = ids.map((id) => {
    const found = VIBE_OPTIONS.find((opt) => opt.id === id);
    return found ? found.label : id;
  });
  return labels.join(", ");
}

export function getSocialSummary(id?: string): string {
  if (!id) return "Solo at my own pace";
  const found = SOCIAL_OPTIONS.find((opt) => opt.id === id);
  return found ? found.label : id;
}

export function getBudgetSummary(id?: string): string {
  if (!id) return "Medium";
  const found = BUDGET_OPTIONS.find((opt) => opt.id === id);
  return found ? found.label : id;
}
