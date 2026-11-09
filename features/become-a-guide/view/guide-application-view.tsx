"use client";

import type { GuideApplicationViewModel } from "../view-model/use-guide-application-view-model";
import { GuideApplicationNav } from "./guide-application-nav";
import { GuideApplicationReview } from "./guide-application-review";
import { GuideApplicationStep1 } from "./guide-application-step1";
import { GuideApplicationStep2 } from "./guide-application-step2";

export function GuideApplicationView({
  step,
  formData,
  errors,
  isSubmitting,
  cityOptions,
  setField,
  setVerificationType,
  handleContinue,
  handleBack,
  handleDone,
}: GuideApplicationViewModel) {
  return (
    <main className="min-h-screen bg-white">
      {/* Top Header / Progress Nav */}
      <GuideApplicationNav step={step} />

      {/* Dynamic Step View */}
      {step === 1 && (
        <GuideApplicationStep1
          formData={formData}
          errors={errors}
          cityOptions={cityOptions}
          setField={setField}
          setVerificationType={setVerificationType}
          onContinue={handleContinue}
          onBack={handleBack}
        />
      )}

      {step === 2 && (
        <GuideApplicationStep2
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          setField={setField}
          onContinue={handleContinue}
          onBack={handleBack}
        />
      )}

      {step === "review" && (
        <GuideApplicationReview
          verificationType={formData.verificationType}
          onDone={handleDone}
        />
      )}
    </main>
  );
}
