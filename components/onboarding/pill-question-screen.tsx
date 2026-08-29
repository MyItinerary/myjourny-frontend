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
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-muted to-background lg:h-dvh lg:max-h-dvh lg:items-center lg:overflow-y-auto lg:px-6 lg:pt-6 lg:pb-6 xl:pt-8 xl:pb-8">
      <OnboardingHeader
        heading={heading}
        subtitle={subtitle}
        backHref={backHref}
        className="lg:hidden"
      />
      <OnboardingLogo className="hidden lg:block lg:w-[211px] lg:shrink-0" />

      <div className="flex flex-1 flex-col gap-4 px-4 lg:mt-8 lg:mb-auto lg:w-[696px] lg:flex-none lg:px-0 xl:mt-12">
        <div className="hidden flex-col items-center gap-3 text-center lg:flex">
          <div
            aria-hidden
            className="h-[68px] w-[74px] rounded-lg border border-[#f5f5f5] bg-white shadow-2xs"
          />
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-sans text-2xl font-extrabold text-[#333134] lg:text-[28px] xl:text-[32px]">{heading}</h1>
            <p className="font-sans text-sm text-[#6F6B72] lg:text-base">{subtitle}</p>
          </div>
        </div>

        <div className={cn("flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:auto-rows-[82px]", gridClassName)}>
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
          className="hidden w-[238px] self-center lg:flex"
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
