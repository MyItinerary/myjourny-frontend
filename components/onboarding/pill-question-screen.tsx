"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";

import { Button } from "@/components/ui/button";
import { CheckboxPill } from "@/components/onboarding/checkbox-pill";
import { OnboardingBottomBar } from "@/components/onboarding/onboarding-bottom-bar";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { OnboardingLogo } from "@/components/onboarding/onboarding-logo";
import { cn } from "@/lib/utils";

export interface PillOption {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
}

interface PillQuestionScreenProps {
  heading: string;
  subtitle: string;
  options: PillOption[];
  /** Caps how many pills can be selected at once (e.g. "select up to 3"). */
  maxSelected?: number;
  continueHref: string;
  backHref: string;
  /** Desktop pill layout — most screens are a 2-col grid, a couple are a single column. */
  gridClassName?: string;
  /** Exact distance between bottom of logo and the illustration/image container on desktop. */
  logoGap?: string;
  /** Called with the final selection right before navigating to continueHref. */
  onContinue?: (selected: string[]) => void;
  /**
   * Lazily reads a previously-persisted selection for this screen (e.g.
   * from preferences-store, if you came back or refreshed mid-quiz).
   * Read in an effect after mount, not during render — the server (and
   * the first client render, to match it) always renders no selection,
   * so this can't cause a hydration mismatch.
   */
  getInitialSelected?: () => string[] | undefined;
}

// Shared shell for every "Check box pills" question screen (pace, interests,
// who-with, budget, what-lights-you-up) — desktop centered column, mobile
// header + scrollable list + sticky Continue.
export function PillQuestionScreen({
  heading,
  subtitle,
  options,
  maxSelected,
  continueHref,
  backHref,
  gridClassName,
  logoGap = "144.85px",
  onContinue,
  getInitialSelected,
}: PillQuestionScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const initial = getInitialSelected?.();
    if (initial && initial.length > 0) setSelected(initial);
    // Only ever meant to run once, right after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleContinue() {
    onContinue?.(selected);
    router.push(continueHref);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      // Single-choice questions (e.g. budget) act like radio buttons: picking
      // a new option replaces the old one instead of being blocked at the cap.
      if (maxSelected === 1) return [id];
      if (maxSelected && prev.length >= maxSelected) return prev;
      return [...prev, id];
    });
  }

  const canContinue = selected.length > 0;

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-muted to-background px-4 py-6 lg:h-dvh lg:max-h-dvh lg:overflow-hidden lg:items-center lg:justify-between lg:px-6 lg:py-3 xl:py-6">
      <OnboardingHeader
        heading={heading}
        subtitle={subtitle}
        backHref={backHref}
        className="lg:hidden"
      />
      <OnboardingLogo className="hidden lg:block lg:w-[160px] xl:w-[195px] lg:shrink-0" />

      <div className="flex flex-1 flex-col justify-center gap-2.5 lg:gap-3 xl:gap-5 px-4 lg:w-[696px] lg:flex-none lg:px-0 my-auto">
        <div className="hidden flex-col items-center gap-2 xl:gap-3 text-center lg:flex">
          <div
            aria-hidden
            className="h-[52px] w-[58px] xl:h-[68px] xl:w-[74px] rounded-lg border border-[#f5f5f5] bg-white shrink-0 shadow-2xs"
          />
          <div className="flex flex-col items-center gap-0.5 xl:gap-1">
            <h1 className="font-sans text-xl lg:text-2xl xl:text-[30px] font-extrabold leading-[1.2] text-[#333134]">
              {heading}
            </h1>
            <p className="font-sans text-xs lg:text-sm xl:text-base font-normal leading-[1.4] text-[#6F6B72]">
              {subtitle}
            </p>
          </div>
        </div>

        <div className={cn("flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-2.5 xl:gap-4", gridClassName)}>
          {options.map((option) => (
            <CheckboxPill
              key={option.id}
              icon={option.icon}
              label={option.label}
              description={option.description}
              selected={selected.includes(option.id)}
              onClick={() => toggle(option.id)}
            />
          ))}
        </div>

        <Button
          size="cta"
          disabled={!canContinue}
          onClick={handleContinue}
          className="hidden w-[220px] xl:w-[238px] h-10 xl:h-12 self-center lg:flex shrink-0"
        >
          Continue
        </Button>
      </div>

      <OnboardingBottomBar
        disabled={!canContinue}
        onContinue={handleContinue}
        className="lg:hidden"
      />
    </div>
  );
}
