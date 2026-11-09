import { cn } from "@/lib/utils";
import type { EnforcementStep } from "../model/terms.types";

export interface EnforcementStepsCardProps {
  steps: EnforcementStep[];
}

export function EnforcementStepsCard({ steps }: EnforcementStepsCardProps) {
  return (
    <div className="my-5 rounded-2xl border border-[#EBEBEB] bg-white p-5 sm:p-6 shadow-xs">
      <div className="space-y-4">
        {steps.map((step) => {
          const isHighlighted = step.isHighlighted ?? step.number === steps.length;
          return (
            <div key={step.number} className="flex items-start gap-4">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isHighlighted
                    ? "bg-[#130404] text-white"
                    : "border border-[#EBEBEB] bg-[#FAF9F7] text-[#6F6B72]"
                )}
              >
                {step.number}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-sans text-sm font-bold text-[#130404]">
                  {step.title}
                </h4>
                <p className="mt-0.5 font-sans text-xs leading-relaxed text-[#6F6B72]">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
