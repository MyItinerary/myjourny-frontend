"use client";

import { ChevronDown, User } from "lucide-react";

import type {
  GuideApplicationErrors,
  GuideApplicationFormData,
  VerificationType,
} from "../model/guide-application.types";
import { DateOfBirthPicker } from "./date-of-birth-picker";
import { RegisteredBusinessIcon } from "./registered-business-icon";

export interface GuideApplicationStep1Props {
  formData: GuideApplicationFormData;
  errors: GuideApplicationErrors;
  cityOptions: string[];
  setField: (field: keyof GuideApplicationFormData, value: string) => void;
  setVerificationType: (type: VerificationType) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function GuideApplicationStep1({
  formData,
  errors,
  cityOptions,
  setField,
  setVerificationType,
  onContinue,
  onBack,
}: GuideApplicationStep1Props) {
  const isIndividual = formData.verificationType === "individual";
  const isBusiness = formData.verificationType === "business";

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
        {/* Full Legal Name */}
        <div>
          <label htmlFor="fullName" className="block font-sans text-sm font-semibold text-[#130404]">
            Full legal name
          </label>
          <p className="mt-0.5 font-sans text-xs text-[#6F6B72]">
            As it appears on your ID, not a nickname or business name.
          </p>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            placeholder="Samuel Samuels"
            className="mt-2 w-full rounded-[8px] border border-transparent bg-[#F4F2EE] px-4 py-3.5 font-sans text-sm text-[#130404] placeholder-[#A8A29E] transition-all duration-200 focus:rounded-[20px] focus:border-[#F5032D] focus:bg-white focus:outline-hidden"
          />
          {errors.fullName && (
            <p className="mt-1 font-sans text-xs text-[#DC2626]">{errors.fullName}</p>
          )}
        </div>

        {/* Date of Birth & Phone Number Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <div>
            <label htmlFor="dob" className="block font-sans text-sm font-semibold text-[#130404]">
              Date of birth
            </label>
            <DateOfBirthPicker
              id="dob"
              value={formData.dateOfBirth}
              onChange={(val) => setField("dateOfBirth", val)}
              error={errors.dateOfBirth}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block font-sans text-sm font-semibold text-[#130404]">
              Phone number
            </label>
            <div className="mt-2 flex items-center rounded-[8px] border border-transparent bg-[#F4F2EE] px-3 py-1.5 transition-all duration-200 focus-within:rounded-[20px] focus-within:border-[#F5032D] focus-within:bg-white focus-within:outline-hidden">
              <span className="flex items-center gap-1.5 border-r border-[#D9D4CC] pr-2.5 font-sans text-xs font-semibold text-[#130404]">
                <span>🇳🇬</span>
                <span>{formData.countryCode}</span>
                <ChevronDown className="size-3 text-[#6F6B72]" />
              </span>
              <input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setField("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
                className="w-full bg-transparent px-2.5 py-2 font-sans text-sm text-[#130404] placeholder-[#A8A29E] focus:outline-hidden"
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 font-sans text-xs text-[#DC2626]">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* City Dropdown */}
        <div>
          <label htmlFor="city" className="block font-sans text-sm font-semibold text-[#130404]">
            City
          </label>
          <div className="relative mt-2">
            <select
              id="city"
              value={formData.city}
              onChange={(e) => setField("city", e.target.value)}
              className="w-full appearance-none rounded-[8px] border border-transparent bg-[#F4F2EE] px-4 py-3.5 font-sans text-sm font-medium text-[#130404] transition-all duration-200 focus:rounded-[20px] focus:border-[#F5032D] focus:bg-white focus:outline-hidden"
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#6F6B72]" />
          </div>
        </div>

        {/* Verification Type Radio Cards */}
        <div className="pt-2">
          <label className="block font-sans text-sm font-semibold text-[#130404]">
            You&apos;re verifying as
          </label>
          <p className="mt-0.5 font-sans text-xs text-[#6F6B72]">
            This decides what we ask for next; neither option costs anything or is preferred over
            the other.
          </p>

          <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {/* Card 1: An individual */}
            <button
              type="button"
              onClick={() => setVerificationType("individual")}
              className={`flex cursor-pointer items-center gap-3.5 rounded-[20px] p-4 text-left transition-all ${
                isIndividual
                  ? "border border-[#F5032D] bg-white ring-1 ring-[#F5032D]/20"
                  : "border border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
              }`}
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-[12px] ${
                  isIndividual ? "bg-[#F5032D] text-white" : "bg-[#F4F2EE] text-[#6F6B72]"
                }`}
              >
                <User className="size-5" />
              </div>
              <div>
                <p className="font-sans text-sm font-bold text-[#130404]">An individual</p>
                <p className="font-sans text-xs text-[#6F6B72]">
                  You&apos;re hosting under your own name
                </p>
              </div>
            </button>

            {/* Card 2: A registered business */}
            <button
              type="button"
              onClick={() => setVerificationType("business")}
              className={`flex cursor-pointer items-center gap-3.5 rounded-[20px] p-4 text-left transition-all ${
                isBusiness
                  ? "border border-[#F5032D] bg-white ring-1 ring-[#F5032D]/20"
                  : "border border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
              }`}
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-[12px] ${
                  isBusiness ? "bg-[#F5032D]" : "bg-[#F4F2EE]"
                }`}
              >
                <RegisteredBusinessIcon stroke={isBusiness ? "white" : "#6F6B72"} />
              </div>
              <div>
                <p className="font-sans text-sm font-bold text-[#130404]">A registered business</p>
                <p className="font-sans text-xs text-[#6F6B72]">
                  You have a CAC-registered company
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6">
          {/* Desktop Layout */}
          <div className="hidden items-center justify-center gap-4 sm:flex">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 min-w-[120px] cursor-pointer items-center justify-center rounded-full border border-[#D9D4CC] bg-white px-8 font-sans text-sm font-semibold text-[#130404] transition-colors hover:bg-[#FAF9F7]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex h-11 min-w-[140px] cursor-pointer items-center justify-center rounded-full bg-[#F5032D] px-8 font-sans text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#D40226]"
            >
              Continue
            </button>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col gap-3 sm:hidden">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#F5032D] px-6 font-sans text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#D40226]"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-[#D9D4CC] bg-white px-6 font-sans text-sm font-semibold text-[#130404] transition-colors hover:bg-[#FAF9F7]"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
