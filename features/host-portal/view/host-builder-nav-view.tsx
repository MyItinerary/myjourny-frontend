import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import type { BuilderStep } from "../model/listing-draft.types";

type Nav = Pick<HostListingBuilderViewModel, "steps" | "step" | "doneCount" | "sheet" | "stepBar" | "onStep" | "onBack" | "onNext">;

function Dot({ s, size }: { s: BuilderStep; size: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold",
        size,
        s.active
          ? "bg-[#F5032D] text-white"
          : s.done
            ? "bg-[#333134] text-white"
            : s.locked
              ? "bg-[#F5F5F5] text-[#BDBDBD]"
              : "bg-white text-[#6F6B72] shadow-[inset_0_0_0_1.5px_#D6D6D6]",
      )}
    >
      {s.done ? "✓" : s.n}
    </span>
  );
}

function Warn({ s }: { s: BuilderStep }) {
  if (!s.attention) return null;
  return <span role="img" aria-label="Needs attention" className="size-2 shrink-0 rounded-full bg-[#D9921C]" />;
}

function StepRow({ s, onStep, tall }: { s: BuilderStep; onStep: (n: number) => void; tall?: boolean }) {
  return (
    <button
      type="button"
      aria-current={s.active ? "step" : undefined}
      disabled={s.blocked}
      onClick={() => onStep(s.n)}
      className={cn(
        "group relative flex w-full cursor-pointer items-center disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent gap-2.5 rounded-[10px] px-4 py-[7px] text-left text-[13px] hover:bg-[#F4F2EE] focus-visible:shadow-[0_0_0_3px_rgba(245,3,45,0.16),inset_0_0_0_1.5px_#F5032D] focus-visible:outline-none",
        tall ? "min-h-12" : "min-h-11",
        s.locked ? "text-[#A09DA3]" : "text-[#333134]",
        s.active ? "bg-[#F4F2EE] font-medium" : "font-normal",
      )}
    >
      <Dot s={s} size="size-5" />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block whitespace-nowrap">{s.label}</span>
        {s.sub && <span className="mt-px block text-[11px] text-[#A09DA3]">{s.sub}</span>}
      </span>
      <Warn s={s} />
      {s.attention && (
        <span
          role="tooltip"
          className="absolute top-full left-[46px] z-10 mt-1 hidden rounded-lg bg-[#2C0101] px-2.5 py-[7px] text-xs whitespace-nowrap text-white group-hover:block group-focus-visible:block"
        >
          {s.attention}
        </span>
      )}
    </button>
  );
}

function Progress({ doneCount }: { doneCount: number }) {
  return (
    <>
      <div className="h-1 overflow-hidden rounded-full bg-[#EEEEEE]">
        <div className="h-full rounded-full bg-[#F5032D] transition-[width]" style={{ width: `${(doneCount / 8) * 100}%` }} />
      </div>
      <div className="mt-2 text-[11px] leading-normal text-[#6F6B72]">{doneCount} of 8 sections done</div>
    </>
  );
}

export function HostBuilderNavView({ vm }: { vm: Nav }) {
  const { steps, sheet, stepBar } = vm;
  return (
    <>
      <nav aria-label="Experience sections" className="hidden shrink-0 flex-col bg-[#FCFCFC] px-3.5 py-[18px] shadow-[inset_-1px_0_0_#E7E7E7] lg:flex lg:w-max lg:min-w-[212px]">
        <div className="px-4 pb-2.5 text-[11px] font-medium tracking-[0.06em] text-[#6F6B72] uppercase">Your experience</div>
        <div className="flex flex-col gap-px">
          {steps.map((s) => (
            <StepRow key={s.n} s={s} onStep={vm.onStep} />
          ))}
        </div>
        <div className="mt-auto px-4 pt-3.5">
          <Progress doneCount={vm.doneCount} />
          <div className="mt-2.5 w-0 min-w-full text-[11px] leading-normal text-[#A09DA3]">Alt up and Alt down to move between steps</div>
        </div>
      </nav>

      <div className="shrink-0 bg-white px-3.5 py-3 shadow-[inset_0_-1px_0_#E7E7E7] lg:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Previous step"
            disabled={!stepBar.canPrev}
            onClick={vm.onBack}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] disabled:cursor-default disabled:text-[#C8C8C8]"
          >
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 7l-5 5 5 5" /></svg>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <div className="text-[11px] font-medium tracking-[0.06em] text-[#F5032D] uppercase">{stepBar.eyebrow}</div>
            <div className="flex items-center justify-center gap-1.5 text-[15px] font-medium">
              <span className="truncate">{stepBar.title}</span>
              {stepBar.attention && <span role="img" aria-label="Needs attention" className="size-2 shrink-0 rounded-full bg-[#D9921C]" />}
            </div>
          </div>
          <button
            type="button"
            aria-label="Next step"
            disabled={!stepBar.canNext}
            onClick={vm.onNext}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-[#333134] text-white disabled:cursor-default disabled:bg-[#F5F5F5] disabled:text-[#C8C8C8]"
          >
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10 7l5 5-5 5" /></svg>
          </button>
        </div>
        <div className="mt-[11px] flex gap-1" aria-hidden>
          {steps.map((s) => (
            <span key={s.n} className={cn("h-1 flex-1 rounded-full", s.active ? "bg-[#F5032D]" : s.done ? "bg-[#333134]" : "bg-[#E7E7E7]")} />
          ))}
        </div>
        <div className="mt-[9px] flex items-center justify-end text-[11.5px]">
          <button type="button" aria-expanded={sheet.open} onClick={sheet.onToggle} className="flex cursor-pointer items-center gap-1 font-medium text-[#333134]">
            All steps
            <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5 5 5-5" /></svg>
          </button>
        </div>
      </div>

      {sheet.open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-[#2C0101]/30 lg:hidden">
          <div role="dialog" aria-label="All steps" className="max-h-[85dvh] overflow-y-auto rounded-t-[20px] bg-white px-3.5 pt-2.5 pb-[18px]">
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[#E0DFDD]" />
            <div className="flex items-center px-1.5 pb-2">
              <span className="text-[11px] font-medium tracking-[0.06em] text-[#6F6B72] uppercase">Your experience</span>
              <button type="button" onClick={sheet.onToggle} className="ml-auto cursor-pointer text-xs font-medium">Close</button>
            </div>
            {steps.map((s) => (
              <StepRow key={s.n} s={s} onStep={vm.onStep} tall />
            ))}
            <div className="px-1.5 pt-3"><Progress doneCount={vm.doneCount} /></div>
          </div>
        </div>
      )}
    </>
  );
}
