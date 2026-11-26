"use client";

import type { GuideApplicationViewModel } from "../view-model/use-guide-application-view-model";
import { ApplicationCard } from "./guide-application-parts";
import { GuideApplicationReview } from "./guide-application-review";
import { GuideApplicationStep1 } from "./guide-application-step1";
import { GuideApplicationStep2 } from "./guide-application-step2";

export function GuideApplicationView(vm: GuideApplicationViewModel) {
  if (vm.step === "review") {
    return (
      <main className="min-h-screen bg-white">
        <GuideApplicationReview verificationType={vm.formData.verificationType} onDone={vm.handleDone} />
      </main>
    );
  }
  return (
    <main>
      <ApplicationCard stepLabel={vm.step === 1 ? "Step 1 of 2" : "Step 2 of 2"}>
        {vm.step === 1 ? (
          <GuideApplicationStep1 {...vm} onContinue={vm.handleContinue} onBack={vm.handleBack} onLogIn={vm.handleLogIn} />
        ) : (
          <GuideApplicationStep2 {...vm} onContinue={vm.handleContinue} onBack={vm.handleBack} onLogIn={vm.handleLogIn} />
        )}
      </ApplicationCard>
    </main>
  );
}
