import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import type { HostHelpViewModel } from "../view-model/use-host-help-view-model";

// Handoff "Listing Builder" prototype, Help: a support banner, the guides to
// read before a first experience, and two ways to go further.
export function HostHelpView({ vm }: { vm: HostHelpViewModel }) {
  const { support } = vm;
  return (
    <div className="flex-1 overflow-y-auto bg-[#FCFCFC] px-7 pt-[26px] pb-[90px]">
      <div className="mx-auto max-w-[900px]">
        <section className="mb-7 flex flex-wrap items-center gap-[18px] rounded-2xl bg-[#2C0101] px-6 py-[22px] text-white">
          <div className="min-w-[240px] flex-1">
            <h2 className="font-heading text-[21px] leading-tight font-extrabold">{support.heading}</h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.55] text-white/[0.78]">{support.body}</p>
          </div>
          <div className="flex shrink-0 gap-[9px]">
            <button
              type="button"
              onClick={support.onWhatsApp}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-[18px] text-sm font-medium text-[#2C0101]"
            >
              <svg aria-hidden width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.3L3.5 20.5l1.6-4.5A8.4 8.4 0 1 1 20.5 11.6z" />
                <path d="M9 9.6c.4 2.6 2.4 4.5 4.9 4.9" />
              </svg>
              <span>{support.whatsapp}</span>
            </button>
            <a
              href={support.emailHref}
              className="flex h-11 items-center gap-2 rounded-full bg-white/[0.14] px-[18px] text-sm font-medium text-white hover:bg-white/[0.24]"
            >
              <svg aria-hidden width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
                <path d="M3.6 6.6l8.4 6 8.4-6" />
              </svg>
              <span>{support.email}</span>
            </a>
          </div>
        </section>

        <h2 className="mb-3.5 text-base font-medium text-[#333134]">{vm.guidesHeading}</h2>
        <div className="mb-7 flex flex-col gap-[9px]">
          {vm.guides.map((guide, i) => (
            <div key={guide.n} className="overflow-hidden rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]">
              <button
                type="button"
                aria-expanded={guide.open}
                onClick={() => vm.onToggleGuide(i)}
                className="flex w-full cursor-pointer items-center gap-3.5 px-[18px] py-[17px] text-left hover:bg-[#FCFCFC]"
              >
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[14px] bg-[#F5F3EF] font-heading text-[13px] font-extrabold text-[#333134]">
                  {guide.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-medium text-[#333134]">{guide.title}</span>
                  <span className="mt-[3px] block text-[12.5px] text-[#6F6B72]">{guide.meta}</span>
                </span>
                <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-[#6F6B72] transition-transform", guide.open && "rotate-180")} strokeWidth={1.9} />
              </button>
              {guide.open && <p className="px-[18px] pr-[18px] pb-5 pl-[66px] text-[13.5px] leading-[1.7] text-pretty text-[#6F6B72]">{guide.body}</p>}
            </div>
          ))}
        </div>

        <div className="grid gap-3.5 md:grid-cols-2">
          <section className="rounded-2xl bg-[#F4F2EE] p-5">
            <h3 className="mb-2 text-sm font-medium text-[#333134]">{vm.cards.safety.title}</h3>
            <p className="text-[13px] leading-[1.6] text-pretty text-[#6F6B72]">{vm.cards.safety.body}</p>
            <button type="button" onClick={vm.onCardAction} className="mt-3.5 h-[38px] cursor-pointer rounded-full bg-white px-[15px] text-[13px] font-medium text-[#333134]">
              {vm.cards.safety.action}
            </button>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-[inset_0_0_0_1px_#E7E7E7]">
            <h3 className="mb-2 text-sm font-medium text-[#333134]">{vm.cards.community.title}</h3>
            <p className="text-[13px] leading-[1.6] text-pretty text-[#6F6B72]">{vm.cards.community.body}</p>
            <button
              type="button"
              onClick={vm.onCardAction}
              className="mt-3.5 h-[38px] cursor-pointer rounded-full bg-white px-[15px] text-[13px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]"
            >
              {vm.cards.community.action}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
