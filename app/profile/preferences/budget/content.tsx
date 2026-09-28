"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EditPreferenceLayout } from "@/components/account settings/edit-preference-layout";
import { BUDGET_OPTIONS } from "@/lib/onboarding/preference-options";
import { useGetProfile, useUpdateProfile } from "@/lib/queries/profile";
import { getPreferences, setPreference } from "@/lib/onboarding/preferences-store";

export function EditBudgetContent() {
  const router = useRouter();
  const { data: profile } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const initial = profile?.budget_range ?? getPreferences().budgetRange ?? "medium";
      setSelected(initial ? [initial] : ["medium"]);
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
      { budget_range: value },
      {
        onSuccess: () => {
          setPreference("budgetRange", value);
          toast.success("Budget range updated successfully!");
          router.push("/profile/preferences");
        },
        onError: () => {
          setPreference("budgetRange", value);
          toast.success("Budget range updated locally!");
          router.push("/profile/preferences");
        },
      }
    );
  }

  return (
    <EditPreferenceLayout
      title="Budget range"
      heading="What's your ideal spend per experience?"
      subtitle="This is an amount you can set aside to experience your destination. Excluding flight and accommodation."
      options={BUDGET_OPTIONS}
      selected={selected}
      maxSelected={1}
      onToggle={handleToggle}
      onSave={handleSave}
      isPending={isPending}
    />
  );
}
