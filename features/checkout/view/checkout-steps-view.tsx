"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CheckoutViewModel } from "../view-model/use-checkout-view-model";

function StepCard({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-[#E7E7E7] bg-white p-6",
        active && "shadow-[0_6px_20px_rgba(0,0,0,0.08)]",
      )}
    >
      {children}
    </section>
  );
}

const stepTitle = "font-sans text-lg font-semibold leading-[27px] text-[#333134]";

// As on Airbnb: 1. log in or sign up, 2. review and pay. Nothing is asked for
// payment here; Confirm and pay books and hands over to Paystack or Stripe.
export function CheckoutStepsView({ steps }: { steps: CheckoutViewModel["steps"] }) {
  const signedIn = steps.account !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href={steps.backHref}
          aria-label="Back to the experience"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] text-[#212121]"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-sans text-2xl font-extrabold leading-[1.2] text-[#333134] lg:text-[32px]">
          Confirm and pay
        </h1>
      </div>

      <StepCard active={!signedIn}>
        <div className="flex items-center justify-between gap-4">
          <h2 className={stepTitle}>1. Log in or sign up</h2>
          {!signedIn && (
            <Button size="cta" onClick={steps.onStartAuth} className="shrink-0 px-8">
              Continue
            </Button>
          )}
        </div>
        {signedIn && (
          <p className="flex items-center gap-2 font-sans text-sm text-[#6F6B72]">
            <CheckCircle2 aria-hidden className="size-4 text-[#02A078]" />
            Logged in as {steps.account}
          </p>
        )}
      </StepCard>

      <StepCard active={signedIn}>
        <h2 className={cn(stepTitle, !signedIn && "text-[#A8A5AA]")}>2. Review and pay</h2>
        {signedIn && (
          <>
            <p className="font-sans text-sm leading-[22px] text-[#6F6B72]">
              Check your booking details. You&apos;ll pay on our secure payment page next.
            </p>
            <Button size="cta" disabled={!steps.canPay} onClick={steps.onConfirm} className="w-full">
              {steps.paying ? "Starting payment…" : "Confirm and pay"}
            </Button>
          </>
        )}
      </StepCard>
    </div>
  );
}
