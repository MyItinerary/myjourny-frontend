"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EditPreferenceLayout } from "@/components/profile/edit-preference-layout";
import { INTEREST_OPTIONS } from "@/lib/onboarding/preference-options";
import { useGetProfile, useUpdateProfile } from "@/lib/queries/profile";
import { getPreferences, setPreference } from "@/lib/onboarding/preferences-store";

export function EditInterestsContent() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const initial = profile?.interests ?? getPreferences().interests ?? ["food", "culture"];
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
      { interests: selected },
      {
        onSuccess: () => {
          setPreference("interests", selected);
          toast.success("Interests updated successfully!");
          router.push("/profile/preferences");
        },
        onError: () => {
          // Even if backend fails (e.g. offline/guest), persist locally
          setPreference("interests", selected);
          toast.success("Interests updated locally!");
          router.push("/profile/preferences");
        },
      }
    );
  }

  return (
    <EditPreferenceLayout
      title="Interests"
      heading="What experiences do you naturally gravitate toward?"
      subtitle="We'll focus on these first."
      options={INTEREST_OPTIONS}
      selected={selected}
      maxSelected={maxSelected}
      onToggle={handleToggle}
      onSave={handleSave}
      isPending={isPending}
      hintText={`You can select up to ${maxSelected} interests`}
    />
  );
}
