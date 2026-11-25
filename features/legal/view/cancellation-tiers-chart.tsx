"use client";

export function CancellationTiersChart() {
  return (
    <div className="my-6 overflow-hidden rounded-[20px] border border-[#EAE7E0] bg-[#FAF9F7] p-5 sm:p-7">
      <div className="overflow-x-auto">
        <div className="min-w-[540px]">
          {/* Rows */}
          <div className="space-y-3.5">
            {/* Flexible */}
            <div className="flex items-center gap-3">
              <div className="flex w-24 shrink-0 items-center gap-1.5 sm:w-28">
                <span className="font-sans text-xs font-bold text-[#130404] sm:text-sm">Flexible</span>
                <span className="rounded-full bg-[#130404] px-1.5 py-0.5 text-[9px] font-semibold text-white tracking-wider sm:text-[10px]">
                  Default
                </span>
              </div>
              <div className="grid h-9 flex-1 grid-cols-[38fr_22fr_22fr_18fr] gap-1 sm:h-10">
                <div className="col-span-3 flex items-center rounded-md bg-[#DCEEE2] px-3 font-sans text-xs font-medium text-[#225737]">
                  Full refund
                </div>
                <div className="col-span-1 flex items-center rounded-md bg-[#EBEAE6] px-3 font-sans text-xs font-medium text-[#6F6B72]">
                  No refund
                </div>
              </div>
            </div>

            {/* Moderate */}
            <div className="flex items-center gap-3">
              <div className="w-24 shrink-0 sm:w-28">
                <span className="font-sans text-xs font-bold text-[#130404] sm:text-sm">Moderate</span>
              </div>
              <div className="grid h-9 flex-1 grid-cols-[38fr_22fr_22fr_18fr] gap-1 sm:h-10">
                <div className="col-span-1 flex items-center rounded-md bg-[#DCEEE2] px-3 font-sans text-xs font-medium text-[#225737]">
                  Full refund
                </div>
                <div className="col-span-2 flex items-center rounded-md bg-[#FDE6B0] px-3 font-sans text-xs font-medium text-[#785412]">
                  50% refund
                </div>
                <div className="col-span-1 flex items-center rounded-md bg-[#EBEAE6] px-3 font-sans text-xs font-medium text-[#6F6B72]">
                  No refund
                </div>
              </div>
            </div>

            {/* Strict */}
            <div className="flex items-center gap-3">
              <div className="w-24 shrink-0 sm:w-28">
                <span className="font-sans text-xs font-bold text-[#130404] sm:text-sm">Strict</span>
              </div>
              <div className="grid h-9 flex-1 grid-cols-[38fr_22fr_22fr_18fr] gap-1 sm:h-10">
                <div className="col-span-1 flex items-center rounded-md bg-[#DCEEE2] px-3 font-sans text-xs font-medium text-[#225737]">
                  Full refund
                </div>
                <div className="col-span-1 flex items-center rounded-md bg-[#FDE6B0] px-3 font-sans text-xs font-medium text-[#785412]">
                  50% refund
                </div>
                <div className="col-span-2 flex items-center rounded-md bg-[#EBEAE6] px-3 font-sans text-xs font-medium text-[#6F6B72]">
                  No refund
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Axis */}
          <div className="mt-4 flex gap-3">
            <div className="w-24 shrink-0 sm:w-28" />
            <div className="relative flex-1">
              <div className="relative h-4 text-xs text-[#8C8889]">
                {/* 0%: When you book */}
                <div className="absolute top-0 left-0 -translate-x-0">
                  <div className="h-1.5 w-px bg-[#B0ACA7] mx-auto mb-1" />
                  <span className="whitespace-nowrap font-sans text-[11px] text-[#6F6B72]">
                    When you book
                  </span>
                </div>

                {/* 38%: 7 days */}
                <div className="absolute top-0 left-[38%] -translate-x-1/2 text-center">
                  <div className="h-1.5 w-px bg-[#B0ACA7] mx-auto mb-1" />
                  <span className="whitespace-nowrap font-sans text-[11px] text-[#6F6B72]">
                    7 days
                  </span>
                </div>

                {/* 60%: 3 days */}
                <div className="absolute top-0 left-[60%] -translate-x-1/2 text-center">
                  <div className="h-1.5 w-px bg-[#B0ACA7] mx-auto mb-1" />
                  <span className="whitespace-nowrap font-sans text-[11px] text-[#6F6B72]">
                    3 days
                  </span>
                </div>

                {/* 82%: 24 hours */}
                <div className="absolute top-0 left-[82%] -translate-x-1/2 text-center">
                  <div className="h-1.5 w-px bg-[#B0ACA7] mx-auto mb-1" />
                  <span className="whitespace-nowrap font-sans text-[11px] text-[#6F6B72]">
                    24 hours
                  </span>
                </div>

                {/* 100%: Start */}
                <div className="absolute top-0 right-0 translate-x-0 text-right">
                  <div className="h-1.5 w-px bg-[#B0ACA7] ml-auto mb-1" />
                  <span className="whitespace-nowrap font-sans text-[11px] text-[#6F6B72]">
                    Start
                  </span>
                </div>
              </div>

              <p className="mt-7 font-sans text-xs text-[#8C8889]">
                Time before the experience starts, in West Africa Time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
