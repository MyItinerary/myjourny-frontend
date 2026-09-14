"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EditPreferenceLayout } from "@/components/profile/edit-preference-layout";
import { VIBE_OPTIONS } from "@/lib/onboarding/preference-options";
import { useGetProfile, useUpdateProfile } from "@/lib/queries/profile";
import { getPreferences, setPreference } from "@/lib/onboarding/preferences-store";

export function EditVibeContent() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const initial = profile?.trip_intent ?? getPreferences().tripIntent ?? ["escape", "adventure"];
      setSelected(initial);
      setInitialized(true);
    }
  }, [profile, initialized]);

  const maxSelected = 3;

  function handleToggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= maxSelected) return prev;
      return [...prev, id];
    });
  }

  function handleSave() {
    updateProfile(
      { trip_intent: selected },
      {
        onSuccess: () => {
          setPreference("tripIntent", selected);
          toast.success("Travel vibe updated successfully!");
          router.push("/profile/preferences");
        },
        onError: () => {
          setPreference("tripIntent", selected);
          toast.success("Travel vibe updated locally!");
          router.push("/profile/preferences");
        },
      }
    );
  }

  return (
    <EditPreferenceLayout
      title="Travel vibe"
      heading="What kind of experiences light you up?"
      subtitle="Everyone shows up for different reasons. This helps us recommend better."
      options={VIBE_OPTIONS}
      selected={selected}
      maxSelected={maxSelected}
      onToggle={handleToggle}
      onSave={handleSave}
      isPending={isPending}
      hintText={`You can select up to ${maxSelected} travel vibes`}
    />
  );
}
