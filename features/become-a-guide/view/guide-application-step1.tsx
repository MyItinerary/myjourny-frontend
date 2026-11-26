"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

import type { GuideApplicationViewModel } from "../view-model/use-guide-application-view-model";
import { DateOfBirthPicker } from "./date-of-birth-picker";
import { ActionButtons, Field, FieldError, inputClass, Select, StepTitle } from "./guide-application-parts";

export type GuideApplicationStep1Props = Pick<
  GuideApplicationViewModel,
  | "formData"
  | "errors"
  | "verificationTypes"
  | "passwordRules"
  | "showPasswordErrors"
  | "signedInEmail"
  | "accountExists"
  | "checkingEmail"
  | "showPassword"
  | "onTogglePassword"
  | "setField"
  | "setVerificationType"
> & { onContinue: () => void; onBack: () => void; onLogIn: () => void };

const describedBy = (id: string, error?: string) => (error ? `${id}-error` : undefined);

// Figma "Guide (Individuals) 4" and "Guide (business) 2": step 1 of the host application.
export function GuideApplicationStep1({
  formData,
  errors,
  verificationTypes,
  passwordRules,
  showPasswordErrors,
  signedInEmail,
  accountExists,
  checkingEmail,
  showPassword,
  onTogglePassword,
  setField,
  setVerificationType,
  onContinue,
  onBack,
  onLogIn,
}: GuideApplicationStep1Props) {
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
        <Field label="How do you run your business?" htmlFor="verificationType">
          <Select
            id="verificationType"
            value={formData.verificationType}
            onChange={(v) => setVerificationType(v as typeof formData.verificationType)}
            options={verificationTypes.map((t) => ({ value: t.key, label: t.label }))}
          />
        </Field>

        <div className="flex flex-col gap-5 sm:flex-row">
          <Field label="First name" htmlFor="firstName" error={errors.firstName} className="sm:flex-1">
            <input
              id="firstName"
              autoComplete="given-name"
              placeholder="Samuel"
              value={formData.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              aria-invalid={!!errors.firstName || undefined}
              aria-describedby={describedBy("firstName", errors.firstName)}
              className={inputClass(!!errors.firstName)}
            />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={errors.lastName} className="sm:flex-1">
            <input
              id="lastName"
              autoComplete="family-name"
              placeholder="Okafor"
              value={formData.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              aria-invalid={!!errors.lastName || undefined}
              aria-describedby={describedBy("lastName", errors.lastName)}
              className={inputClass(!!errors.lastName)}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dob" className="font-sans text-base leading-6 font-medium text-[#333134]">
            Date of birth
          </label>
          <DateOfBirthPicker
            id="dob"
            value={formData.dateOfBirth}
            placeholder="DD/MM/YYYY"
            onChange={(val) => setField("dateOfBirth", val)}
            error={errors.dateOfBirth}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="font-sans text-base leading-6 font-medium text-[#333134]">
            Phone number
          </label>
          <div className="flex gap-2">
            <span className="flex h-12 shrink-0 items-center gap-1 rounded-full bg-[#F4F2EE] px-3 font-sans text-base font-medium text-[#333134]">
              <Image src="/images/become-a-guide/apply/flag-ng.svg" alt="" width={24} height={24} unoptimized className="size-6" />
              {formData.countryCode}
              <Image src="/images/become-a-guide/apply/phone-chevron-down.svg" alt="" width={20} height={20} unoptimized className="m-0.5 size-5" />
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="9033222222"
              value={formData.phoneNumber}
              onChange={(e) => setField("phoneNumber", e.target.value)}
              aria-invalid={!!errors.phoneNumber || undefined}
              aria-describedby={describedBy("phone", errors.phoneNumber)}
              className={cn(inputClass(!!errors.phoneNumber), "min-w-0 flex-1")}
            />
          </div>
          <FieldError id="phone-error" message={errors.phoneNumber} />
        </div>

        {signedInEmail ? null : (
          <>
            <Field label="Email address" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                aria-invalid={!!errors.email || undefined}
                aria-describedby={describedBy("email", errors.email)}
                className={inputClass(!!errors.email)}
              />
              {accountExists && (
                <div role="alert" className="rounded-[20px] bg-[#FEF2F3] px-4 py-3 font-sans text-[15px] leading-6 text-[#333134]">
                  There&apos;s already an account with this email. Log in and we&apos;ll add hosting to it.{" "}
                  <button type="button" onClick={onLogIn} className="cursor-pointer font-bold text-[#F5032D] underline underline-offset-2">
                    Log in
                  </button>
                </div>
              )}
            </Field>
            <div className="flex flex-col gap-5">
              <Field label="Password" htmlFor="password" error={errors.password}>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setField("password", e.target.value)}
                    aria-invalid={!!errors.password || undefined}
                    aria-describedby={cn("password-rules", errors.password && "password-error")}
                    className={cn(inputClass(!!errors.password), "pr-12")}
                  />
                  <button
                    type="button"
                    onClick={onTogglePassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#6F6B72] hover:bg-[#E9E1D2]"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </Field>
              <ul id="password-rules" aria-label="Password rules" className="flex flex-col gap-2.5">
                {passwordRules.map((rule) => {
                  const missed = showPasswordErrors && !rule.met;
                  return (
                    <li key={rule.label} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className={cn("size-6 shrink-0", rule.met ? "bg-[#0CBA65]" : missed ? "bg-[#DC2626]" : "bg-[#6F6B72]")}
                        style={{
                          mask: "url(/images/become-a-guide/apply/check-circle.svg) center / contain no-repeat",
                          WebkitMask: "url(/images/become-a-guide/apply/check-circle.svg) center / contain no-repeat",
                        }}
                      />
                      <span
                        className={cn(
                          "font-sans text-base leading-6 font-medium",
                          rule.met ? "text-[#333134]" : missed ? "text-[#DC2626]" : "text-[#6F6B72]",
                        )}
                      >
                        {rule.label}
                        <span className="sr-only">{rule.met ? " (done)" : " (not yet)"}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
      <ActionButtons primaryLabel="Continue" onPrimary={onContinue} onBack={onBack} busy={checkingEmail} busyLabel="Checking…" />
    </form>
  );
}
