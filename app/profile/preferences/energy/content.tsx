"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EditPreferenceLayout } from "@/components/account settings/edit-preference-layout";
import { ENERGY_OPTIONS } from "@/lib/onboarding/preference-options";
import { useGetProfile, useUpdateProfile } from "@/lib/queries/profile";
import { getPreferences, setPreference } from "@/lib/onboarding/preferences-store";

export function EditEnergyContent() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const initial = profile?.energy_level ?? getPreferences().energyLevel ?? "high";
      setSelected(initial ? [initial] : ["high"]);
      setInitialized(true);
    }
  }, [profile, initialized]);

  function handleToggle(id: string) {
    // Single-choice behaves like radio button
    setSelected([id]);
  }

  function handleSave() {
    const value = selected[0];
    if (!value) return;

    updateProfile(
      { energy_level: value },
      {
        onSuccess: () => {
          setPreference("energyLevel", value);
          toast.success("Energy level updated successfully!");
          router.push("/profile/preferences");
        },
        onError: () => {
          setPreference("energyLevel", value);
          toast.success("Energy level updated locally!");
          router.push("/profile/preferences");
        },
      }
    );
  }

  return (
    <EditPreferenceLayout
      title="Energy level"
      heading="What kind of pace do you enjoy when exploring?"
      subtitle="This helps us match experiences to your vibe."
      options={ENERGY_OPTIONS}
      selected={selected}
      maxSelected={1}
      onToggle={handleToggle}
      onSave={handleSave}
      isPending={isPending}
    />
  );
}
