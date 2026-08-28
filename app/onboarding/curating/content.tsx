"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { InterstitialScreen } from "@/components/onboarding/interstitial-screen";
import { clearPreferences, getPreferences } from "@/lib/onboarding/preferences-store";
import { useUpdateProfile } from "@/lib/queries/profile";

// Figma: "Desktop - 13" (2068:25490) / "Interstitial" (2068:25907)
// Note: the mobile frame has a decorative background of scattered category
// chips behind the content — omitted here as a cosmetic-only simplification;
// the logo/illustration/heading/button content (what actually carries
// meaning) is implemented 1:1.
export function CuratingContent() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const hasFlushed = useRef(false);

  useEffect(() => {
    // StrictMode/fast-refresh can mount this twice — only flush once.
    if (hasFlushed.current) return;
    hasFlushed.current = true;

    // Keep "Hang tight while we do our thing" true even on a fast
    // connection — wait for whichever is longer, the save or this floor —
    // then auto-continue. The "Continue" button (InterstitialScreen below)
    // still lets an impatient user skip ahead immediately either way.
    const minVisibleTime = new Promise<void>((resolve) => setTimeout(resolve, 1200));

    const { energyLevel, interests, socialStyle, budgetRange, tripIntent } = getPreferences();
    updateProfile.mutate(
      {
        energy_level: energyLevel,
        interests,
        social_style: socialStyle,
        budget_range: budgetRange,
        trip_intent: tripIntent,
        completed: true,
      },
      {
        onSuccess: () => {
          clearPreferences();
          minVisibleTime.then(() => router.replace("/"));
        },
        // The interstitial still lets the user continue into the app even
        // if this save failed — it's a background sync, not a form gate.
        onError: () => {
          toast.error("Couldn't save your preferences. You can update them later.");
          minVisibleTime.then(() => router.replace("/"));
        },
      }
    );
    // Runs once on mount by design — getPreferences()/updateProfile aren't
    // meant to re-trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InterstitialScreen
      heading="We're curating your experiences..."
      subtitle="Hang tight while we do our thing"
      primaryLabel="Continue"
      primaryHref="/"
      illustration={
        <div
          aria-hidden
          className="size-[214px] rounded-[30px] border-4 border-[#f5f5f5] bg-[#fafafa]"
        />
      }
    />
  );
}
