import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { HostBuilderPreviewView } from "./host-builder-preview-view";
import { StepBasics, StepCategory, StepWhere } from "./host-builder-steps-a";
import { StepIncluded, StepPrice, StepWhen } from "./host-builder-steps-b";
import { StepPhotos, StepRequirements, StepReview } from "./host-builder-steps-c";

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
    9: <StepReview vm={vm} />,
  }[vm.step];

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <nav aria-label="Listing sections" className="flex shrink-0 gap-1 overflow-x-auto bg-[#FCFCFC] p-3 shadow-[inset_0_-1px_0_#E7E7E7] lg:w-[196px] lg:flex-col lg:gap-px lg:overflow-visible lg:px-3.5 lg:py-[18px] lg:shadow-[inset_-1px_0_0_#E7E7E7]">
        <div className="hidden px-2 pb-2.5 text-[11px] font-medium tracking-[0.06em] text-[#6F6B72] uppercase lg:block">Your listing</div>
        {vm.steps.map((s) => (
          <button
            key={s.n}
            type="button"
            aria-current={s.active ? "step" : undefined}
            onClick={() => vm.onStep(s.n)}
            className={cn(
              "flex min-h-9 shrink-0 cursor-pointer items-center gap-[9px] rounded-[10px] px-2 py-[7px] text-[13px] whitespace-nowrap text-[#333134] hover:bg-[#F4F2EE] lg:w-full lg:whitespace-normal",
              s.active ? "bg-[#F4F2EE] font-medium" : "font-normal",
            )}
          >
            <span aria-hidden className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold", s.done ? "bg-[#0CBA65] text-white" : s.active ? "bg-[#F5032D] text-white" : "bg-[#EEEEEE] text-[#6F6B72]")}>
              {s.done ? "✓" : s.n}
            </span>
            <span className="text-left leading-tight">{s.label}</span>
          </button>
        ))}
        <div className="mt-auto hidden px-2 pt-3 lg:block">
          <div className="h-1 overflow-hidden rounded-full bg-[#EEEEEE]">
            <div className="h-full rounded-full bg-[#F5032D] transition-[width]" style={{ width: `${(vm.doneCount / 8) * 100}%` }} />
          </div>
          <div className="mt-2 text-[11px] leading-normal text-[#6F6B72]">{vm.doneCount} of 8 sections done</div>
        </div>
      </nav>

      <div className="min-w-0 flex-1 overflow-y-auto px-5 pt-6 pb-20 lg:px-7">
        <div className="mx-auto max-w-[560px]">
          {body}
          <div className="mt-9 flex items-center gap-3">
            {vm.step > 1 && (
              <button type="button" onClick={vm.onBack} className="h-11 cursor-pointer rounded-full bg-white px-5 text-sm font-medium shadow-[inset_0_0_0_1px_#E7E7E7]">
                Back
              </button>
            )}
            {vm.step < 9 && (
              <button type="button" onClick={vm.onNext} className="h-11 cursor-pointer rounded-full bg-[#F5032D] px-5 text-sm font-medium text-white">
                {vm.nextLabel}
              </button>
            )}
            <button type="button" onClick={vm.onSaveLater} className="cursor-pointer text-[13px] font-medium text-[#6F6B72] underline">
              Save and finish later
            </button>
          </div>
        </div>
      </div>

      <HostBuilderPreviewView vm={vm} />
    </div>
  );
}
