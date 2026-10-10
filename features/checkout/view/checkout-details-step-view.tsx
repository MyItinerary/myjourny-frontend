import { Check, Info } from "lucide-react";
import Link from "next/link";

import { GoogleAuthButton } from "@/components/onboarding/google-auth-button";
import { PasswordInput } from "@/components/onboarding/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CountryCodePickerView } from "./country-code-picker-view";
import type { CheckoutViewModel } from "../view-model/use-checkout-view-model";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-base font-medium leading-6 text-[#333134]">{label}</span>
      {children}
    </label>
  );
}

function Terms({ verb }: { verb: "continuing" | "confirming" }) {
  return (
    <p className="font-sans text-sm font-medium leading-[21px] text-[#6F6B72]">
      By {verb} you agree to our{" "}
      <Link href="/terms" className="text-[#F5032D]">
        terms of service
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className="text-[#F5032D]">
        privacy policy
      </Link>
    </p>
  );
}

// Figma "Desktop - 4" to "Desktop - 7" and "Desktop - 18" to "Desktop - 20": one
// form in three steps. Email and phone, then Continue; then a password and
// "Confirm and pay"; or, when already signed in, just "Confirm and pay".
export function CheckoutDetailsStepView({ form }: { form: CheckoutViewModel["form"] }) {
  const { step } = form;
  const emailValid = form.emailLocked || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (step === "details") form.onContinue();
        else form.onConfirm();
      }}
    >
      <h1 className="font-sans text-2xl font-extrabold leading-[1.2] text-[#333134] lg:text-[32px]">
        Confirm your details and pay
      </h1>

      <Field label="Email address">
        <div className="relative">
          <Input
            type="email"
            size="cta"
            autoComplete="email"
            placeholder="Enter email address"
            value={form.email}
            readOnly={form.emailLocked}
            onChange={(e) => form.onEmailChange(e.target.value)}
            className="pr-12 font-medium text-[#333134]"
          />
          {form.email && emailValid && (
            <Check className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-[#02A078]" aria-label="Valid email" />
          )}
        </div>
      </Field>

      <div className="flex flex-col gap-2">
        <span className="font-sans text-base font-medium leading-6 text-[#333134]">Phone number</span>
        <div className="flex gap-2">
          <CountryCodePickerView
            selected={form.country.selected}
            options={form.country.options}
            onSelect={form.country.onSelect}
            disabled={form.phoneLocked}
          />
          <Input
            type="tel"
            size="cta"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="Enter phone number"
            aria-label="Phone number"
            value={form.phone}
            readOnly={form.phoneLocked}
            onChange={(e) => form.onPhoneChange(e.target.value)}
            maxLength={14}
            className="font-medium text-[#333134]"
          />
        </div>
        <p className="flex items-start gap-1 font-sans text-xs leading-[18px] text-[#6F6B72]">
          <Info className="size-[18px] shrink-0" />
          We’ll only contact you with essential updates or changes to your booking
        </p>
      </div>

      {step === "details" && (
        <>
          <Button type="submit" size="cta" disabled={!form.canContinue} className="w-full">
            Continue
          </Button>
          <Terms verb="continuing" />
          <div className="flex items-center gap-3 px-6">
            <span aria-hidden className="h-px flex-1 bg-[#E7E7E7]" />
            <span className="font-sans text-base text-[#333134]">or</span>
            <span aria-hidden className="h-px flex-1 bg-[#E7E7E7]" />
          </div>
          <GoogleAuthButton loading={form.googleLoading} onCredential={form.onGoogleCredential} />
        </>
      )}

      {step === "password" && (
        <>
          <div className="flex flex-col gap-4">
            <Field label="Password">
              <PasswordInput
                placeholder="Enter password here"
                value={form.password}
                onChange={form.onPasswordChange}
              />
            </Field>
            <Field label="Confirm password">
              <PasswordInput
                placeholder="Re enter password here"
                value={form.confirmPassword}
                onChange={form.onConfirmPasswordChange}
              />
            </Field>
            <p
              role={form.passwordError ? "alert" : undefined}
              className={`flex items-start gap-2 font-sans text-sm font-medium leading-[21px] ${
                form.passwordError ? "text-[#F5032D]" : "text-[#6F6B72]"
              }`}
            >
              <Info className="mt-0.5 size-5 shrink-0" />
              {form.passwordError ?? "Your password should contain at least 8 characters, a letter and a number"}
            </p>
            {form.emailTaken && (
              <p className="font-sans text-sm text-[#6F6B72]">
                That email already has an account.{" "}
                <Link href={form.loginHref} className="font-medium text-[#F5032D]">
                  Log in instead
                </Link>
              </p>
            )}
          </div>
          <Terms verb="confirming" />
          <Button type="submit" size="cta" disabled={!form.canPay} className="w-full">
            {form.pending ? "Starting checkout…" : "Confirm and pay"}
          </Button>
        </>
      )}

      {step === "pay" && (
        <>
          <Terms verb="confirming" />
          <Button type="submit" size="cta" disabled={!form.canPay} className="w-full">
            {form.pending ? "Starting checkout…" : "Confirm and pay"}
          </Button>
        </>
      )}
    </form>
  );
}
