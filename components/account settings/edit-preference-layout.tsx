"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckboxPill } from "@/components/onboarding/checkbox-pill";
import type { PreferenceOption } from "@/lib/onboarding/preference-options";

interface EditPreferenceLayoutProps {
  title: string;
  heading: string;
  subtitle: string;
  options: PreferenceOption[];
  selected: string[];
  maxSelected?: number;
  onToggle: (id: string) => void;
  onSave: () => void;
  isPending: boolean;
  hintText?: string;
  backHref?: string;
}

export function EditPreferenceLayout({
  title,
  heading,
  subtitle,
  options,
  selected,
  maxSelected,
  onToggle,
  onSave,
  isPending,
  hintText,
  backHref = "/profile/preferences",
}: EditPreferenceLayoutProps) {
  const router = useRouter();
  const canSave = selected.length > 0;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#FAF9F7] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[640px] flex-1">
        {/* Top Header */}
        <div className="relative mb-6 flex items-center justify-between sm:mb-8">
          <Link
            href={backHref}
            aria-label="Back to preferences"
            className="flex size-10 items-center justify-center rounded-full border border-[#E0DFDD] bg-white text-foreground transition-colors hover:bg-[#F4F2EE]"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="absolute left-0 right-0 text-center font-heading text-[18px] font-bold text-foreground sm:text-[20px]">
            {title}
          </h1>
          <div className="size-10" />
        </div>

        {/* Question Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-heading text-[22px] font-extrabold leading-[1.3] text-foreground sm:text-[28px]">
            {heading}
          </h2>
          <p className="mt-2 font-sans text-[15px] font-normal leading-[22px] text-muted-foreground sm:text-[16px]">
            {subtitle}
          </p>
        </div>

        {/* Options List */}
        <div className="grid grid-cols-1 gap-3 sm:gap-3.5">
          {options.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <CheckboxPill
                key={option.id}
                icon={option.icon}
                label={option.label}
                description={option.description}
                selected={isSelected}
                onClick={() => onToggle(option.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Action Area */}
      <div className="mx-auto mt-8 w-full max-w-[640px] pt-4">
        {hintText && (
          <div className="mb-4 flex items-center justify-center gap-2 font-sans text-[14px] text-[#FF640A]">
            <Lightbulb className="size-4 shrink-0 text-[#FF640A]" />
            <span>{hintText}</span>
          </div>
        )}

        <Button
          size="cta"
          disabled={!canSave || isPending}
          onClick={onSave}
          className="w-full cursor-pointer"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Saving changes…
            </span>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}
