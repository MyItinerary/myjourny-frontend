"use client";

import Link from "next/link";

import type { GuideApplicationViewModel } from "../view-model/use-guide-application-view-model";
import { ActionButtons, Field, inputClass, Select, StepTitle } from "./guide-application-parts";

export type GuideApplicationStep2Props = Pick<
  GuideApplicationViewModel,
  "formData" | "errors" | "isSubmitting" | "countries" | "applyingEmail" | "accountExists" | "setField"
> & { onContinue: () => void; onBack: () => void; onLogIn: () => void };

const describedBy = (id: string, error?: string) => (error ? `${id}-error` : undefined);

// Figma "Guide (Individuals) 2" and "Guide (busiess) 2": step 2 of the host application.
export function GuideApplicationStep2({
  formData,
  errors,
  isSubmitting,
  countries,
  applyingEmail,
  accountExists,
  setField,
  onContinue,
  onBack,
  onLogIn,
}: GuideApplicationStep2Props) {
  const business = formData.verificationType === "business";
  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
    >
      <StepTitle />
      <div className="flex flex-col gap-5">
        <Field
          label={business ? "Company's brand name" : "Brand name (optional)"}
          htmlFor="businessName"
          hint={business ? "As it appears on your CAC certificate." : "The name guests see, if you host under one."}
          error={errors.businessName}
        >
          <input
            id="businessName"
            autoComplete="organization"
            placeholder={business ? "Samuel Tours Ltd" : "Samuel Tours"}
            value={formData.businessName ?? ""}
            onChange={(e) => setField("businessName", e.target.value)}
            aria-invalid={!!errors.businessName || undefined}
            aria-describedby={describedBy("businessName", errors.businessName)}
            className={inputClass(!!errors.businessName)}
          />
        </Field>

        {business && (
          <Field label="CAC registration number" htmlFor="cacNumber" hint="Your RC or BN number." error={errors.cacNumber}>
            <input
              id="cacNumber"
              placeholder="RC1234566"
              value={formData.cacNumber ?? ""}
              onChange={(e) => setField("cacNumber", e.target.value.toUpperCase())}
              aria-invalid={!!errors.cacNumber || undefined}
              aria-describedby={describedBy("cacNumber", errors.cacNumber)}
              className={inputClass(!!errors.cacNumber)}
            />
          </Field>
        )}

        <Field
          label="Website (optional)"
          htmlFor="website"
          hint="We use it to check what your business does."
          error={errors.website}
        >
          <input
            id="website"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="samuel.com"
            value={formData.website}
            onChange={(e) => setField("website", e.target.value)}
            aria-invalid={!!errors.website || undefined}
            aria-describedby={describedBy("website", errors.website)}
            className={inputClass(!!errors.website)}
          />
        </Field>

        <Field label="Where are you registered?" htmlFor="country" error={errors.country}>
          <Select
            id="country"
            value={formData.country}
            onChange={(v) => setField("country", v)}
            invalid={!!errors.country}
            placeholder="Country"
            options={countries.map((c) => ({ value: c, label: c }))}
          />
        </Field>

        {accountExists ? (
          <div role="alert" className="rounded-[20px] bg-[#FEF2F3] px-4 py-3 font-sans text-base leading-6 text-[#333134]">
            There&apos;s already an account with <span className="font-bold">{applyingEmail}</span>. Log in and we&apos;ll add hosting
            to it.{" "}
            <button type="button" onClick={onLogIn} className="cursor-pointer font-bold text-[#F5032D] underline underline-offset-2">
              Log in to continue
            </button>
          </div>
        ) : (
          applyingEmail && (
            <p className="rounded-[20px] bg-[#F4F2EE] px-4 py-3 font-sans text-base leading-6 text-black">
              You&apos;re applying with <span className="font-bold">{applyingEmail}</span>. You&apos;ll use the same login for
              travelling and hosting.
            </p>
          )
        )}
      </div>
      <p className="font-sans text-base leading-6 text-black">
        By continuing you agree to our{" "}
        <Link href="/terms" target="_blank" className="font-bold text-[#F5032D]">
          terms of service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" target="_blank" className="font-bold text-[#F5032D]">
          privacy policy
        </Link>
        .
      </p>
      <ActionButtons primaryLabel="Submit" onPrimary={onContinue} onBack={onBack} busy={isSubmitting} />
    </form>
  );
}
