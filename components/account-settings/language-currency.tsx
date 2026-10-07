"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/api-error";
import { useGetProfile, useUpdateProfile } from "@/lib/queries/profile";
import { ModalFooter, ModalShell, Row, SavedBanner, SectionSkeleton } from "@/components/account-settings/section-ui";

type Option = { value: string; label: string; meta?: string };

// Saved to the profile as preferred_language / preferred_currency / timezone
// (an IANA name, which itin validates).
const LANGUAGE_OPTIONS: Option[] = [
  { value: "en-NG", label: "English (Nigeria)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "fr", label: "French" },
  { value: "yo", label: "Yoruba" },
  { value: "ha", label: "Hausa" },
  { value: "ig", label: "Igbo" },
];

const CURRENCY_OPTIONS: Option[] = [
  { value: "NGN", label: "Naira (₦)", meta: "Default for experiences hosted in Nigeria" },
  { value: "USD", label: "US dollars ($)", meta: "Default everywhere else" },
];

const TIMEZONE_OPTIONS: Option[] = [
  { value: "Africa/Lagos", label: "West Africa Standard Time, GMT+1 (Lagos)" },
  { value: "Africa/Accra", label: "Greenwich Mean Time, GMT+0" },
  { value: "Africa/Maputo", label: "Central African Time, GMT+2" },
  { value: "Africa/Nairobi", label: "East Africa Time, GMT+3" },
];

type ModalKey = "language" | "currency" | "timezone";

const MODAL_DEFS: Record<ModalKey, { title: string; options: Option[]; fallback: string }> = {
  language: { title: "Language", options: LANGUAGE_OPTIONS, fallback: "en-NG" },
  currency: { title: "Display currency", options: CURRENCY_OPTIONS, fallback: "NGN" },
  timezone: { title: "Time zone", options: TIMEZONE_OPTIONS, fallback: "Africa/Lagos" },
};

function labelFor(key: ModalKey, value: string) {
  // Values set elsewhere (e.g. another IANA zone) are shown as they are.
  return MODAL_DEFS[key].options.find((o) => o.value === value)?.label ?? value;
}

function savedMessageFor(key: ModalKey, label: string) {
  switch (key) {
    case "language":
      return `Saved. Your preferred language is ${label}.`;
    case "currency":
      return `Saved. Your display currency is ${label}. Each experience is still charged in its host’s currency.`;
    case "timezone":
      return `Saved. Reminders and start times now use ${label}.`;
  }
}

export function LanguageCurrencySection() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const [modal, setModal] = useState<ModalKey | null>(null);
  const [draft, setDraft] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  if (isLoading) return <SectionSkeleton />;

  const values: Record<ModalKey, string> = {
    language: profile?.preferred_language || MODAL_DEFS.language.fallback,
    currency: profile?.preferred_currency || MODAL_DEFS.currency.fallback,
    timezone: profile?.timezone || MODAL_DEFS.timezone.fallback,
  };

  function openModal(key: ModalKey) {
    setSavedMessage(null);
    setDraft(values[key]);
    setModal(key);
  }

  function save(key: ModalKey) {
    const field = { language: "preferred_language", currency: "preferred_currency", timezone: "timezone" }[key];
    updateProfile.mutate(
      { [field]: draft },
      {
        onSuccess: () => {
          setSavedMessage(savedMessageFor(key, labelFor(key, draft)));
          setModal(null);
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Couldn't save that change.")),
      },
    );
  }

  return (
    <div className="max-w-[720px] flex-1">
      <div className="font-sans text-[32px] leading-[1.2] font-extrabold text-foreground">
        Language and currency
      </div>

      {savedMessage && (
        <SavedBanner message={savedMessage} onDismiss={() => setSavedMessage(null)} />
      )}

      <div className="mt-2">
        <Row
          label="Language"
          value={labelFor("language", values.language)}
          actionLabel="Edit"
          onAction={() => openModal("language")}
        />
        <Row
          label="Currency"
          value={labelFor("currency", values.currency)}
          note="Each experience is priced in its host’s own currency. Experiences hosted in Nigeria are charged in Naira through Paystack, everywhere else in US dollars."
          actionLabel="Edit"
          onAction={() => openModal("currency")}
        />
        <div className="flex items-start justify-between gap-8 py-7">
          <div className="flex flex-1 flex-col gap-1">
            <div className="text-base font-medium text-foreground">Time zone</div>
            <div className="text-base text-muted-foreground">{labelFor("timezone", values.timezone)}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              Reminders and start times use this zone.
            </div>
          </div>
          <button
            type="button"
            onClick={() => openModal("timezone")}
            className="shrink-0 pt-0.5 text-[15px] font-medium text-brand underline hover:text-primary cursor-pointer"
          >
            Edit
          </button>
        </div>
      </div>

      {modal && (
        <ModalShell title={MODAL_DEFS[modal].title} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-2.5">
            {MODAL_DEFS[modal].options.map(({ value, label, meta }) => {
              const selected = draft === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDraft(value)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 text-left",
                    selected ? "border-brand border-2" : "border-border",
                  )}
                >
                  <div>
                    <div className="text-[15px] font-medium text-foreground">{label}</div>
                    {meta && <div className="text-[13px] text-muted-foreground">{meta}</div>}
                  </div>
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-brand" : "border-border",
                    )}
                  >
                    {selected && <div className="size-2.5 rounded-full bg-brand" />}
                  </div>
                </button>
              );
            })}
          </div>
          <ModalFooter
            onCancel={() => setModal(null)}
            saveDisabled={updateProfile.isPending}
            onSave={() => save(modal)}
          />
        </ModalShell>
      )}
    </div>
  );
}
