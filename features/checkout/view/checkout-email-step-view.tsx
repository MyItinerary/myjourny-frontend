import { Info, Timer } from "lucide-react";
import Link from "next/link";

import { GoogleAuthButton } from "@/components/onboarding/google-auth-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CheckoutViewModel } from "../view-model/use-checkout-view-model";

// Figma "Desktop - 4" / "Desktop - 5" (filled): where to send the booking.
export function CheckoutEmailStepView({ email }: { email: CheckoutViewModel["email"] }) {
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        email.onContinue();
      }}
    >
      <div className="flex w-fit items-center gap-1 rounded-3xl bg-[#F4F2EE] p-2">
        <Timer className="size-[21px] text-[#6F6B72]" />
        <p className="font-sans text-sm font-medium leading-[21px] text-[#6F6B72]">We’ll hold your spot for 5 minutes</p>
      </div>

      <h1 className="max-w-[484px] font-sans text-2xl font-extrabold leading-[1.2] text-[#333134] lg:text-[32px]">
        Where should we send your booking details?
      </h1>

      <div className="flex flex-col gap-2">
        <Input
          type="email"
          size="cta"
          autoComplete="email"
          placeholder="Enter email address"
          value={email.value}
          onChange={(e) => email.onChange(e.target.value)}
          aria-label="Email address"
        />
        <p className="flex items-start gap-1 font-sans text-xs leading-[18px] text-[#6F6B72]">
          <Info className="size-[18px] shrink-0" />
          Enter a valid email address, one that you use to access your account
        </p>
      </div>

      <Button
        type="submit"
        size="cta"
        variant="outline"
        disabled={!email.canContinue}
        className="w-full border-[#F5032D] bg-transparent text-[#F5032D] hover:bg-[#F5032D]/5 hover:text-[#F5032D] disabled:border-[#F5032D] disabled:bg-transparent disabled:text-[#F5032D]"
      >
        {email.pending ? "Continuing…" : "Continue"}
      </Button>

      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px flex-1 bg-[#E7E7E7]" />
        <span className="font-sans text-base text-[#333134]">or</span>
        <span aria-hidden className="h-px flex-1 bg-[#E7E7E7]" />
      </div>

      <GoogleAuthButton loading={email.googleLoading} onCredential={email.onGoogleCredential} />

      <p className="text-center font-sans text-sm font-medium leading-[21px] text-[#6F6B72]">
        By continuing you agree to our{" "}
        <Link href="/terms" className="text-[#F5032D]">
          terms of service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#F5032D]">
          privacy policy
        </Link>
      </p>
    </form>
  );
}
