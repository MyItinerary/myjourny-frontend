"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EditPreferenceLayout } from "@/components/account settings/edit-preference-layout";
import { SOCIAL_OPTIONS } from "@/lib/onboarding/preference-options";
import { useGetProfile, useUpdateProfile } from "@/lib/queries/profile";
import { getPreferences, setPreference } from "@/lib/onboarding/preferences-store";

export function EditSocialContent() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const initial = profile?.social_style ?? getPreferences().socialStyle ?? "solo";
      setSelected(initial ? [initial] : ["solo"]);
      setInitialized(true);
    }
  }, [profile, initialized]);

  function handleToggle(id: string) {
    setSelected([id]);
  }

  function handleSave() {
    const value = selected[0];
    if (!value) return;

    updateProfile(
      { social_style: value },
      {
        onSuccess: () => {
          setPreference("socialStyle", value);
          toast.success("Social style updated successfully!");
          router.push("/profile/preferences");
        },
        onError: () => {
          setPreference("socialStyle", value);
          toast.success("Social style updated locally!");
          router.push("/profile/preferences");
        },
      }
    );
  }

  return (
    <EditPreferenceLayout
      title="Social style"
      heading="How do you prefer to experience new places?"
      subtitle="We'll focus on these first."
      options={SOCIAL_OPTIONS}
      selected={selected}
      maxSelected={1}
      onToggle={handleToggle}
      onSave={handleSave}
      isPending={isPending}
    />
  );
}
