"use client";

import { cn } from "@/lib/utils";

import type { HostEarningsViewModel } from "../view-model/use-host-earnings-view-model";

const CARD = "rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";
const STATUS: Record<string, string> = {
  paid: "bg-[#F0FCF5] text-[#0CBA65]",
  pending: "bg-[#FDF7EB] text-[#B4760A]",
  partial: "bg-[#FDF7EB] text-[#B4760A]",
  failed: "bg-[#FFF0F0] text-[#C43131]",
  cancelled: "bg-[#F2F2F2] text-[#6F6B72]",
};

export function HostEarningsView({ vm }: { vm: HostEarningsViewModel }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FCFCFC] px-7 pt-5 pb-[90px]">
      {vm.loading ? (
        <p role="status" className="py-10 text-center text-sm text-[#6F6B72]">Loading earnings…</p>
      ) : (
        <>
          {vm.error && <p role="alert" className="mb-4 rounded-xl bg-[#FFF0F0] p-3 text-sm text-[#9F2525]">{vm.error}</p>}

          <div className="mb-5 grid grid-cols-2 gap-3.5 xl:grid-cols-4">
            {vm.stats.map((stat) => (
              <div key={stat.label} className={cn(CARD, "px-[18px] py-4")}>
                <p className="text-[12.5px] text-[#6F6B72]">{stat.label}</p>
                <p className="mt-2 font-heading text-2xl leading-[1.2] font-extrabold text-[#333134]">{stat.value}</p>
                <p className="mt-1.5 text-xs text-[#6F6B72]">{stat.note}</p>
              </div>
            ))}
          </div>

          <section className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center gap-2.5 px-[18px] py-[15px] shadow-[inset_0_-1px_0_#E7E7E7]">
              <h2 className="text-sm font-medium text-[#333134]">Earnings by booking</h2>
              <button
                type="button"
                onClick={vm.onDownload}
                className="ml-auto h-[34px] cursor-pointer rounded-full bg-white px-3.5 text-[12.5px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]"
              >
                Download a statement
              </button>
            </div>

            <div className="overflow-x-auto">
              <div role="table" aria-label="Earnings" className="min-w-[900px]">
                <div role="row" className="flex h-[38px] items-center gap-3.5 px-[18px] text-[11.5px] font-medium text-[#6F6B72] shadow-[inset_0_-1px_0_#F0F0F0]">
                  <span role="columnheader" className="w-[180px] shrink-0">Booking</span>
                  <span role="columnheader" className="min-w-0 flex-1">Experience</span>
                  <span role="columnheader" className="w-28 shrink-0">Session</span>
                  <span role="columnheader" className="w-[68px] shrink-0">Currency</span>
                  <span role="columnheader" className="w-[100px] shrink-0 text-right">Earned</span>
                  <span role="columnheader" className="w-[100px] shrink-0 text-right">Pending</span>
                  <span role="columnheader" className="w-[100px] shrink-0 text-right">Paid out</span>
                  <span role="columnheader" className="w-[88px] shrink-0">Status</span>
                </div>

                {vm.rows.map((row) => (
                  <div key={row.id} role="row" className="flex min-h-[58px] items-center gap-3.5 px-[18px] shadow-[inset_0_-1px_0_#F0F0F0]">
                    <span className="w-[180px] shrink-0 truncate text-[12.5px] text-[#6F6B72]" title={row.booking}>{row.booking}</span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-[#333134]">{row.experience}</span>
                    <span className="w-28 shrink-0 text-[12.5px] text-[#6F6B72]">{row.date}</span>
                    <span className="w-[68px] shrink-0 text-[12.5px] text-[#6F6B72]">{row.currency}</span>
                    <span className="w-[100px] shrink-0 text-right text-[13px] text-[#333134]">{row.earned}</span>
                    <span className="w-[100px] shrink-0 text-right text-[13px] text-[#6F6B72]">{row.pending}</span>
                    <span className="w-[100px] shrink-0 text-right text-[13px] font-medium text-[#333134]">{row.paidOut}</span>
                    <span className="w-[88px] shrink-0">
                      <span className={cn("inline-flex rounded-full px-2 py-1 text-[10.5px] font-medium", STATUS[row.status])}>
                        {row.statusLabel}
                      </span>
                    </span>
                  </div>
                ))}

                {vm.none && <p className="px-6 py-14 text-center text-[13.5px] text-[#6F6B72]">{vm.noneMessage}</p>}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
