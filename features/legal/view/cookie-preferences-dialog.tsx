"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";

import type { CookiePreferences } from "../model/cookie-preferences.types";

export interface CookiePreferencesDialogProps {
  open: boolean;
  preferences: CookiePreferences;
  onClose: () => void;
  onToggle: (key: keyof Omit<CookiePreferences, "strictlyNecessary">) => void;
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onSave: () => void;
}

export function CookiePreferencesDialog({
  open,
  preferences,
  onClose,
  onToggle,
  onAcceptAll,
  onRejectNonEssential,
  onSave,
}: CookiePreferencesDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(18,18,18,0.5)] sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie preferences"
        className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
          <div>
            <h2 className="font-sans text-xl font-bold text-[#130404]">Cookie preferences</h2>
            <p className="mt-1 font-sans text-xs text-[#6F6B72]">
              Manage which cookies you allow us to use on MyJourny.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[#6F6B72] hover:bg-[#FAF9F7] hover:text-[#130404]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="divide-y divide-[#EBEBEB] py-2">
          {/* Strictly Necessary */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-sm font-bold text-[#130404]">Strictly necessary</h3>
                <span className="rounded-full bg-[#FAF9F7] px-2 py-0.5 font-sans text-[11px] font-semibold text-[#6F6B72]">
                  Always active
                </span>
              </div>
              <p className="mt-1 font-sans text-xs leading-relaxed text-[#6F6B72]">
                Essential for signing in, security, and making bookings. These cannot be turned off.
              </p>
            </div>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#130404] text-white">
              <Check className="size-3.5 stroke-[3]" />
            </span>
          </div>

          {/* Preferences */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-sans text-sm font-bold text-[#130404]">Preferences</h3>
              <p className="mt-1 font-sans text-xs leading-relaxed text-[#6F6B72]">
                Remembers your selected area, currency, filters, and language.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.preferences}
              aria-label="Preferences cookies"
              onClick={() => onToggle("preferences")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-hidden ${
                preferences.preferences ? "bg-[#E11D48]" : "bg-[#E0DFDD]"
              }`}
            >
              <span
                className={`inline-block size-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  preferences.preferences ? "translate-x-5" : "translate-x-0.5"
                } mt-0.5`}
              />
            </button>
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-sans text-sm font-bold text-[#130404]">Analytics</h3>
              <p className="mt-1 font-sans text-xs leading-relaxed text-[#6F6B72]">
                Counts visits and shows which pages are used so we can improve the platform.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.analytics}
              aria-label="Analytics cookies"
              onClick={() => onToggle("analytics")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-hidden ${
                preferences.analytics ? "bg-[#E11D48]" : "bg-[#E0DFDD]"
              }`}
            >
              <span
                className={`inline-block size-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  preferences.analytics ? "translate-x-5" : "translate-x-0.5"
                } mt-0.5`}
              />
            </button>
          </div>

          {/* Personalisation */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-sans text-sm font-bold text-[#130404]">Personalisation</h3>
              <p className="mt-1 font-sans text-xs leading-relaxed text-[#6F6B72]">
                Links your activity to your taste profile to show relevant experiences.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.personalisation}
              aria-label="Personalisation cookies"
              onClick={() => onToggle("personalisation")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-hidden ${
                preferences.personalisation ? "bg-[#E11D48]" : "bg-[#E0DFDD]"
              }`}
            >
              <span
                className={`inline-block size-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  preferences.personalisation ? "translate-x-5" : "translate-x-0.5"
                } mt-0.5`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end border-t border-[#EBEBEB] pt-4">
          <button
            type="button"
            onClick={onRejectNonEssential}
            className="rounded-full border border-[#E0DFDD] px-4 py-2 font-sans text-xs font-semibold text-[#130404] transition-colors hover:bg-[#FAF9F7] cursor-pointer"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            className="rounded-full border border-[#E0DFDD] px-4 py-2 font-sans text-xs font-semibold text-[#130404] transition-colors hover:bg-[#FAF9F7] cursor-pointer"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-[#130404] px-5 py-2 font-sans text-xs font-semibold text-white transition-colors hover:bg-[#2A0808] cursor-pointer"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
