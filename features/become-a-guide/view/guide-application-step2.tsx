"use client";

import Link from "next/link";

import type {
  GuideApplicationErrors,
  GuideApplicationFormData,
} from "../model/guide-application.types";

export interface GuideApplicationStep2Props {
  formData: GuideApplicationFormData;
  errors: GuideApplicationErrors;
  isSubmitting: boolean;
  setField: (field: keyof GuideApplicationFormData, value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function GuideApplicationStep2({
  formData,
  errors,
  isSubmitting,
  setField,
  onContinue,
  onBack,
}: GuideApplicationStep2Props) {
  const isBusiness = formData.verificationType === "business";
  const submitButtonText = isBusiness ? "Create an account" : "Continue";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Step Heading */}
      <div className="mb-8">
        <span className="font-sans text-xs font-bold tracking-wider text-[#F5032D]">
          CREATE AN ACCOUNT
        </span>
        <h1 className="mt-2 font-sans text-2xl font-extrabold tracking-tight text-[#130404] sm:text-3xl">
          Let&apos;s get to know you
        </h1>
      </div>

      <div className="space-y-6">
        {/* Business-Only Fields */}
        {isBusiness && (
          <>
            <div>
              <label
                htmlFor="businessName"
                className="block font-sans text-sm font-semibold text-[#130404]"
              >
                Registered business name
              </label>
              <p className="mt-0.5 font-sans text-xs text-[#6F6B72]">
                As it appears on your CAC certificate
              </p>
              <input
                id="businessName"
                type="text"
                value={formData.businessName || ""}
                onChange={(e) => setField("businessName", e.target.value)}
                placeholder="Enter business name"
                className="mt-2 w-full rounded-[8px] border border-transparent bg-[#F4F2EE] px-4 py-3.5 font-sans text-sm text-[#130404] placeholder-[#A8A29E] transition-all duration-200 focus:rounded-[20px] focus:border-[#F5032D] focus:bg-white focus:outline-hidden"
              />
              {errors.businessName && (
                <p className="mt-1 font-sans text-xs text-[#DC2626]">{errors.businessName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="cacNumber"
                className="block font-sans text-sm font-semibold text-[#130404]"
              >
                CAC registration number
              </label>
              <p className="mt-0.5 font-sans text-xs text-[#6F6B72]">RC or BN number.</p>
              <input
                id="cacNumber"
                type="text"
                value={formData.cacNumber || ""}
                onChange={(e) => setField("cacNumber", e.target.value)}
                placeholder="RC1234567"
                className="mt-2 w-full rounded-[8px] border border-transparent bg-[#F4F2EE] px-4 py-3.5 font-sans text-sm text-[#130404] placeholder-[#A8A29E] transition-all duration-200 focus:rounded-[20px] focus:border-[#F5032D] focus:bg-white focus:outline-hidden"
              />
              {errors.cacNumber && (
                <p className="mt-1 font-sans text-xs text-[#DC2626]">{errors.cacNumber}</p>
              )}
            </div>
          </>
        )}

        {/* Website Field */}
        <div>
          <label htmlFor="website" className="block font-sans text-sm font-semibold text-[#130404]">
            Add a website
          </label>
          <input
            id="website"
            type="text"
            value={formData.website}
            onChange={(e) => setField("website", e.target.value)}
            placeholder="website.com"
            className="mt-2 w-full rounded-[8px] border border-transparent bg-[#F4F2EE] px-4 py-3.5 font-sans text-sm text-[#130404] placeholder-[#A8A29E] transition-all duration-200 focus:rounded-[20px] focus:border-[#F5032D] focus:bg-white focus:outline-hidden"
          />
          <p className="mt-1 font-sans text-xs text-[#6F6B72]">
            We will use the website to verify your business activities.
          </p>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block font-sans text-sm font-semibold text-[#130404]">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="email@gmail.com"
            className="mt-2 w-full rounded-[8px] border border-transparent bg-[#F4F2EE] px-4 py-3.5 font-sans text-sm text-[#130404] placeholder-[#A8A29E] transition-all duration-200 focus:rounded-[20px] focus:border-[#F5032D] focus:bg-white focus:outline-hidden"
          />
          {errors.email && (
            <p className="mt-1 font-sans text-xs text-[#DC2626]">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block font-sans text-sm font-semibold text-[#130404]">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="Enter password"
            className="mt-2 w-full rounded-[8px] border border-transparent bg-[#F4F2EE] px-4 py-3.5 font-sans text-sm text-[#130404] placeholder-[#A8A29E] transition-all duration-200 focus:rounded-[20px] focus:border-[#F5032D] focus:bg-white focus:outline-hidden"
          />
          {errors.password && (
            <p className="mt-1 font-sans text-xs text-[#DC2626]">{errors.password}</p>
          )}
        </div>

        {/* Legal Disclaimer */}
        <p className="pt-2 font-sans text-xs text-[#6F6B72]">
          By continuing you agree to our{" "}
          <Link href="/terms" className="font-semibold text-[#F5032D] hover:underline">
            terms of service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-[#F5032D] hover:underline">
            privacy policy
          </Link>
        </p>

        {/* Buttons */}
        <div className="pt-6">
          {/* Desktop Layout */}
          <div className="hidden items-center justify-center gap-4 sm:flex">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="inline-flex h-11 min-w-[120px] cursor-pointer items-center justify-center rounded-full border border-[#D9D4CC] bg-white px-8 font-sans text-sm font-semibold text-[#130404] transition-colors hover:bg-[#FAF9F7] disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={isSubmitting}
              className="inline-flex h-11 min-w-[140px] cursor-pointer items-center justify-center rounded-full bg-[#F5032D] px-8 font-sans text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#D40226] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : submitButtonText}
            </button>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col gap-3 sm:hidden">
            <button
              type="button"
              onClick={onContinue}
              disabled={isSubmitting}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#F5032D] px-6 font-sans text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#D40226] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : submitButtonText}
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-[#D9D4CC] bg-white px-6 font-sans text-sm font-semibold text-[#130404] transition-colors hover:bg-[#FAF9F7] disabled:opacity-50"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
