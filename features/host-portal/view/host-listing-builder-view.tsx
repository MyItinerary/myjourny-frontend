import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { HostBuilderCategoryTipView } from "./host-builder-category-tip-view";
import { HostBuilderNavView } from "./host-builder-nav-view";
import { HostBuilderTipsView } from "./host-builder-tips-view";
import { StepBasics, StepCategory, StepWhere } from "./host-builder-steps-a";
import { StepIncluded, StepPrice, StepWhen } from "./host-builder-steps-b";
import { StepPhotos, StepRequirements, StepBooking, StepReview, StepReviews } from "./host-builder-steps-c";

export function HostListingBuilderView({ vm }: { vm: HostListingBuilderViewModel }) {
  const body = {
    1: <StepBasics vm={vm} />,
    2: <StepCategory vm={vm} />,
    3: <StepWhere vm={vm} />,
    4: <StepWhen vm={vm} />,
    5: <StepPrice vm={vm} />,
    6: <StepIncluded vm={vm} />,
    7: <StepRequirements vm={vm} />,
    8: <StepPhotos vm={vm} />,
    9: <StepReviews vm={vm} />,
    10: <StepBooking vm={vm} />,
    11: <StepReview vm={vm} />,
  }[vm.step];

  if (vm.loadingListing) {
    return <p className="flex-1 px-7 pt-8 text-sm text-[#6F6B72]">Loading your experience…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <HostBuilderNavView vm={vm} />

      <div className="min-w-0 flex-1 overflow-y-auto px-5 pt-6 pb-20 lg:px-7">
        <div className="mx-auto flex max-w-[560px] flex-col gap-8 lg:ml-12 xl:mx-0 xl:max-w-none xl:flex-row xl:items-start">
          <div className="min-w-0 xl:w-[560px] xl:shrink-0">
            {body}
            {vm.check && (
              <label className="mt-9 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#F4F2EE] px-[18px] py-4">
                <input
                  type="checkbox"
                  checked={vm.check.checked}
                  onChange={vm.check.onToggle}
                  className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-[#F5032D]"
                />
                <span>
                  <span className="block text-[13.5px] font-medium text-[#333134]">I have checked this section</span>
                  <span className="mt-0.5 block text-[12.5px] leading-normal text-[#6F6B72]">{vm.check.note}</span>
                </span>
              </label>
            )}
            <div className={cn("flex items-center justify-end gap-3", vm.check ? "mt-5" : "mt-9")}>
              <button type="button" onClick={vm.onSaveLater} className="h-11 cursor-pointer rounded-full bg-white px-5 text-sm font-medium shadow-[inset_0_0_0_1px_#E7E7E7]">
                Save and exit
              </button>
              {vm.step < 11 && (
                <button
                  type="button"
                  onClick={vm.onNext}
                  disabled={!vm.canContinue}
                  className="h-11 cursor-pointer rounded-full bg-[#F5032D] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {vm.nextLabel}
                </button>
              )}
            </div>
          </div>
          {(vm.step === 1 && vm.tip) || vm.categoryTip ? (
            <div className="hidden xl:sticky xl:top-0 xl:block xl:w-[300px] xl:shrink-0">
              {vm.categoryTip ? <HostBuilderCategoryTipView /> : vm.tip && <HostBuilderTipsView field={vm.tip} />}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
