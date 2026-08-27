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
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-muted to-background lg:items-center lg:justify-center lg:px-6 lg:py-16">
      <OnboardingHeader
        heading={heading}
        subtitle={subtitle}
        backHref={backHref}
        className="lg:hidden"
      />
      <OnboardingLogo className="hidden lg:absolute lg:top-[86px] lg:left-1/2 lg:block lg:w-[211px] lg:-translate-x-1/2" />

      <div className="flex flex-1 flex-col gap-6 px-4 lg:w-[696px] lg:flex-none">
        <div className="hidden flex-col items-center gap-[26px] text-center lg:flex">
          <div
            aria-hidden
            className="h-[79px] w-[86px] rounded-lg border border-[#f5f5f5] bg-white"
          />
          <div className="flex flex-col items-center gap-[9px]">
            <p className="font-sans text-[32px] font-extrabold text-foreground">{heading}</p>
            <p className="text-base text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className={cn("flex flex-col gap-4 lg:grid lg:grid-cols-2", gridClassName)}>
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
