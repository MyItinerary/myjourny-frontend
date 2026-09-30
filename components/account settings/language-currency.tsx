"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModalFooter, ModalShell, Row, SavedBanner } from "@/components/account settings/section-ui";

const LANGUAGE_OPTIONS: [string, string][] = [
  ["English (Nigeria)", ""],
  ["English (UK)", ""],
  ["French", ""],
  ["Yoruba", ""],
  ["Hausa", ""],
  ["Igbo", ""],
];

const CURRENCY_OPTIONS: [string, string][] = [
  ["Naira (₦)", "Default for experiences hosted in Nigeria"],
  ["US dollars ($)", "Default everywhere else"],
];

const TIMEZONE_OPTIONS: [string, string][] = [
  ["West Africa Standard Time, GMT+1 (Lagos)", ""],
  ["Greenwich Mean Time, GMT+0", ""],
  ["Central African Time, GMT+2", ""],
  ["East Africa Time, GMT+3", ""],
];

type ModalKey = "language" | "currency" | "timezone";

const MODAL_DEFS: Record<ModalKey, { title: string; options: [string, string][] }> = {
  language: { title: "Language", options: LANGUAGE_OPTIONS },
  currency: { title: "Display currency", options: CURRENCY_OPTIONS },
  timezone: { title: "Time zone", options: TIMEZONE_OPTIONS },
};

interface LocaleValues {
  language: string;
  currency: string;
  timezone: string;
}

const INITIAL_VALUES: LocaleValues = {
  language: "English (Nigeria)",
  currency: "Naira (₦)",
  timezone: "West Africa Standard Time, GMT+1 (Lagos)",
};

function savedMessageFor(key: ModalKey, value: string) {
  switch (key) {
    case "language":
      return `Saved. MyJourny is now in ${value}.`;
    case "currency":
      return `Saved. Totals in your bookings list are shown in ${value.startsWith("Naira") ? "Naira" : "US dollars"}. Each experience is still charged in its host’s currency.`;
    case "timezone":
      return `Saved. Reminders and start times now use ${value}.`;
  }
}

export function LanguageCurrencySection() {
  const [values, setValues] = useState<LocaleValues>(INITIAL_VALUES);
  const [modal, setModal] = useState<ModalKey | null>(null);
  const [draft, setDraft] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function openModal(key: ModalKey) {
    setSavedMessage(null);
    setDraft(values[key]);
    setModal(key);
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
          value={values.language}
          actionLabel="Edit"
          onAction={() => openModal("language")}
        />
        <Row
          label="Currency"
          value={values.currency}
          note="Each experience is priced in its host’s own currency. Experiences hosted in Nigeria are charged in Naira through Paystack, everywhere else in US dollars."
          actionLabel="Edit"
          onAction={() => openModal("currency")}
        />
        <div className="flex items-start justify-between gap-8 py-7">
          <div className="flex flex-1 flex-col gap-1">
            <div className="text-base font-medium text-foreground">Time zone</div>
            <div className="text-base text-muted-foreground">{values.timezone}</div>
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
            {MODAL_DEFS[modal].options.map(([label, meta]) => {
              const selected = draft === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDraft(label)}
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
            onSave={() => {
              const key = modal;
              setValues((v) => ({ ...v, [key]: draft }));
              setSavedMessage(savedMessageFor(key, draft));
              setModal(null);
            }}
          />
        </ModalShell>
      )}
    </div>
  );
}
