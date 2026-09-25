"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Globe,
  Pencil,
  Target,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useGetProfile } from "@/lib/queries/profile";
import { getPreferences } from "@/lib/onboarding/preferences-store";
import {
  getBudgetSummary,
  getEnergySummary,
  getInterestsSummary,
  getSocialSummary,
  getVibeSummary,
} from "@/lib/onboarding/preference-options";
import { useEffect, useState } from "react";

interface PreferenceRowProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
}

function PreferenceRow({ icon, title, value, href }: PreferenceRowProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-[20px] border border-[#E0DFDD]/70 bg-white p-4 transition-all duration-200 hover:border-brand/40 hover:shadow-sm sm:p-5"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-[#F4F2EE] text-foreground transition-colors group-hover:bg-[#FFF0F2] group-hover:text-brand">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-[16px] font-semibold leading-[22px] text-foreground">
            {title}
          </h3>
          <p className="truncate font-sans text-[14px] font-normal leading-[20px] text-muted-foreground">
            {value}
          </p>
        </div>
      </div>
      <div className="ml-3 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] text-muted-foreground transition-all duration-200 group-hover:bg-brand group-hover:text-white">
        <Pencil className="size-4" />
      </div>
    </Link>
  );
}

export function PreferencesView() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const localPrefs = mounted ? getPreferences() : {};

  // Merge backend profile data with local preferences store draft
  const interests = profile?.interests ?? localPrefs.interests;
  const energy = profile?.energy_level ?? localPrefs.energyLevel;
  const vibe = profile?.trip_intent ?? localPrefs.tripIntent;
  const social = profile?.social_style ?? localPrefs.socialStyle;
  const budget = profile?.budget_range ?? localPrefs.budgetRange;

  const interestsText = getInterestsSummary(interests);
  const energyText = getEnergySummary(energy);
  const vibeText = getVibeSummary(vibe);
  const socialText = getSocialSummary(social);
  const budgetText = getBudgetSummary(budget);

  return (
    <div className="min-h-screen bg-[#FAF9F7] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[640px]">
        {/* Top Header */}
        <div className="relative mb-6 flex items-center justify-between sm:mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex size-10 items-center justify-center rounded-full border border-[#E0DFDD] bg-white text-foreground transition-colors hover:bg-[#F4F2EE] cursor-pointer"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="absolute left-0 right-0 text-center font-heading text-[20px] font-bold text-foreground sm:text-[22px]">
            Your preferences
          </h1>
          <div className="size-10" />
        </div>

        {/* Subtitle */}
        <div className="mb-6 sm:mb-8">
          <p className="font-sans text-[15px] font-normal leading-[22px] text-muted-foreground sm:text-[16px]">
            Help us match experiences to your vibe
          </p>
        </div>

        {/* Preference Rows (matching Image 2) */}
        <div className="flex flex-col gap-3.5 sm:gap-4">
          <PreferenceRow
            icon={<Target className="size-5" />}
            title="Interests"
            value={interestsText}
            href="/profile/preferences/interests"
          />

          <PreferenceRow
            icon={<Zap className="size-5" />}
            title="Energy level"
            value={energyText}
            href="/profile/preferences/energy"
          />

          <PreferenceRow
            icon={<Globe className="size-5" />}
            title="Travel vibe"
            value={vibeText}
            href="/profile/preferences/vibe"
          />

          <PreferenceRow
            icon={<Users className="size-5" />}
            title="Social style"
            value={socialText}
            href="/profile/preferences/social"
          />

          <PreferenceRow
            icon={<Wallet className="size-5" />}
            title="Budget range"
            value={budgetText}
            href="/profile/preferences/budget"
          />
        </div>
      </div>
    </div>
  );
}
