import { Check, Info, Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CheckoutViewModel } from "../view-model/use-checkout-view-model";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-base font-medium leading-6 text-[#333134]">{label}</span>
      {children}
    </label>
  );
}

// The Nigerian flag, round (Figma "Flags/Round").
function NigeriaFlag() {
  return (
    <span aria-hidden className="flex size-6 overflow-hidden rounded-full">
      <span className="h-full flex-1 bg-[#008751]" />
      <span className="h-full flex-1 bg-white" />
      <span className="h-full flex-1 bg-[#008751]" />
    </span>
  );
}

// Figma "Desktop - 6" / "Desktop - 7" (filled): confirm contact details, then pay.
export function CheckoutDetailsStepView({ details }: { details: CheckoutViewModel["details"] }) {
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        details.onConfirm();
      }}
    >
      <h1 className="font-sans text-2xl font-extrabold leading-[1.2] text-[#333134] lg:text-[32px]">
        Confirm your details and pay
      </h1>

      <Field label="Email address">
        <div className="flex h-12 items-center gap-2.5 rounded-full bg-muted px-4">
          <span className="min-w-0 flex-1 truncate font-sans text-base font-medium text-[#333134]">{details.email}</span>
          <Check className="size-5 shrink-0 text-[#02A078]" aria-label="Verified" />
        </div>
      </Field>

      <div className="flex flex-col gap-2">
        <span className="font-sans text-base font-medium leading-6 text-[#333134]">Phone number</span>
        <div className="flex gap-2">
          <span className="flex h-12 shrink-0 items-center gap-1 rounded-full bg-muted px-3">
            <NigeriaFlag />
            <span className="font-sans text-base font-medium text-[#333134]">+234</span>
          </span>
          <Input
            type="tel"
            size="cta"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="Enter phone number"
            aria-label="Phone number"
            value={details.phone}
            onChange={(e) => details.onPhoneChange(e.target.value)}
            maxLength={11}
          />
        </div>
        <p className="flex items-start gap-1 font-sans text-xs leading-[18px] text-[#6F6B72]">
          <Info className="size-[18px] shrink-0" />
          We’ll only contact you with essential updates or changes to your booking
        </p>
      </div>

      <Field label="Leave a note for the guide">
        <textarea
          value={details.note}
          onChange={(e) => details.onNoteChange(e.target.value)}
          placeholder="Anything you’d need to make your experience easy or memorable?"
          rows={4}
          className="min-h-[120px] w-full resize-none rounded-lg bg-muted px-4 py-3 font-sans text-base font-medium text-[#333134] outline-none placeholder:text-[#BCBCBC] focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      <div className="flex items-start gap-4 rounded-lg bg-[#F4F2EE] p-4">
        <Lock className="size-6 shrink-0 text-[#6F6B72]" />
        <div className="flex flex-col gap-2 font-sans">
          <p className="text-lg font-semibold leading-[27px] text-[#333134]">Payment secured by Paystack</p>
          <p className="text-sm leading-[22px] text-[#757575]">
            Payment methods like card, bank transfer, USSD and Pay with Zap all available
          </p>
        </div>
      </div>

      <p className="font-sans text-sm font-medium leading-[21px] text-[#6F6B72]">
        By confirming you agree to our{" "}
        <Link href="/terms" className="text-[#F5032D]">
          terms of service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#F5032D]">
          privacy policy
        </Link>
      </p>

      <Button type="submit" size="cta" disabled={!details.canPay} className="w-full">
        {details.pending ? "Starting checkout…" : "Confirm and pay"}
      </Button>
    </form>
  );
}
