import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostHomeData, ListingStatus } from "../model/home.types";
import type { HostHomeViewModel } from "../view-model/use-host-home-view-model";

const CARD = "rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";
const EYEBROW = "text-[11px] font-medium tracking-[0.06em] text-[#F5032D] uppercase";

const CHIP: Record<ListingStatus, string> = {
  Live: "text-[#0CBA65] bg-[#F0FCF5]",
  Draft: "text-[#6F6B72] bg-[#F5F5F5]",
  "In review": "text-[#B4760A] bg-[#FDF7EB]",
  Hidden: "text-[#6F6B72] bg-[#F5F5F5]",
  Paused: "text-[#B4760A] bg-[#FDF7EB]",
  "Sold out": "text-[#3086FF] bg-[#F0F6FF]",
  Archived: "text-[#6F6B72] bg-[#F5F5F5]",
  Rejected: "text-[#F5032D] bg-[#FEF2F3]",
};

function StatusChip({ status }: { status: ListingStatus }) {
  return (
    <span className={cn("inline-block rounded-full px-[9px] py-[3px] text-[11px] font-medium whitespace-nowrap", CHIP[status])}>
      {status}
    </span>
  );
}

function FullHome({ vm, data }: { vm: HostHomeViewModel; data: HostHomeData }) {
  const peak = Math.max(...data.earnings.months.map((m) => m.amountK), 1);
  const lastMonth = data.earnings.months.length - 1;

  return (
    <div className="flex-1 overflow-y-auto bg-[#FCFCFC] px-7 pt-6 pb-[90px]">
      <div className="mb-5 grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <div key={stat.label} className={cn(CARD, "px-[18px] py-4")}>
            <p className="text-[12.5px] text-[#6F6B72]">{stat.label}</p>
            <p className="mt-2 font-heading text-[26px] leading-[1.2] font-extrabold text-[#333134]">{stat.value}</p>
            <p className={cn("mt-1.5 text-xs", stat.tone === "green" ? "text-[#0CBA65]" : "text-[#6F6B72]")}>{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <section className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center gap-2 px-[18px] py-[15px] shadow-[inset_0_-1px_0_#E7E7E7]">
              <h2 className="text-sm font-medium text-[#333134]">Needs you today</h2>
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#F5032D] text-[11px] font-medium text-white">
                {data.attention.length}
              </span>
            </div>
            {data.attention.map((item) => (
              <div key={item.id} className="flex items-center gap-3.5 px-[18px] py-3.5 shadow-[inset_0_-1px_0_#F0F0F0] last:shadow-none">
                <span aria-hidden className={cn("size-2 shrink-0 rounded-full", item.urgent ? "bg-[#F5032D]" : "bg-[#D9921C]")} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-[#333134]">{item.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-[#6F6B72]">{item.sub}</p>
                </div>
                <span className={cn("text-xs font-medium whitespace-nowrap", item.urgent ? "text-[#F5032D]" : "text-[#6F6B72]")}>
                  {item.timer}
                </span>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-8 shrink-0 items-center rounded-full px-[13px] text-[12.5px] font-medium",
                    item.urgent ? "bg-[#F5032D] text-white" : "bg-white text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]",
                  )}
                >
                  {item.action}
                </Link>
              </div>
            ))}
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2.5">
              <h2 className="text-sm font-medium text-[#333134]">Your listings</h2>
              <Link href={vm.listingsHref} className="ml-auto text-[12.5px] font-medium text-[#F5032D]">
                See all
              </Link>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-3">
              {data.listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={listing.href}
                  className={cn(CARD, "overflow-hidden text-left transition-shadow hover:shadow-[inset_0_0_0_1px_#E0DFDD,0_1px_2px_rgba(16,24,40,0.05)]")}
                >
                  <div className="relative h-24 w-full">
                    <Image src={listing.imageUrl} alt="" fill sizes="240px" className="object-cover" />
                  </div>
                  <div className="px-[13px] py-3">
                    <StatusChip status={listing.status} />
                    <p className="mt-2 text-[13.5px] leading-[1.3] font-medium text-[#333134]">{listing.title}</p>
                    <p className="mt-1 text-xs text-[#6F6B72]">{listing.meta}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className={cn(CARD, "p-[18px]")}>
            <div className="mb-[18px] flex items-baseline gap-2.5">
              <h2 className="text-sm font-medium text-[#333134]">What you have made</h2>
              <span className="text-[12.5px] text-[#6F6B72]">last six months</span>
              <span className="ml-auto font-heading text-lg font-extrabold text-[#333134]">{data.earnings.total}</span>
            </div>
            <div className="flex h-[150px] items-end gap-4">
              {data.earnings.months.map((m, i) => (
                <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[11.5px] text-[#6F6B72]">₦{m.amountK}k</span>
                  <div
                    className={cn("w-full max-w-14 rounded-lg", i === lastMonth ? "bg-[#F5032D]" : "bg-[#F4F2EE]")}
                    style={{ height: `${Math.round((m.amountK / peak) * 104)}px` }}
                  />
                  <span className={cn("text-[11.5px]", i === lastMonth ? "font-medium text-[#333134]" : "text-[#6F6B72]")}>
                    {m.month}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {data.next && (
            <section className="overflow-hidden rounded-2xl bg-[#2C0101] p-[18px] text-white">
              <p className="text-[11px] font-medium tracking-[0.06em] text-white/60 uppercase">Next experience</p>
              <h2 className="mt-2 font-heading text-[19px] leading-[1.25] font-extrabold">{data.next.title}</h2>
              <p className="mt-1.5 text-[13px] text-white/80">{data.next.when}</p>
              <div className="mt-4 flex gap-[18px] border-t border-white/[0.14] pt-4">
                <div>
                  <p className="text-[11px] text-white/60">Guests</p>
                  <p className="mt-[3px] text-[15px] font-medium">{data.next.guests}</p>
                </div>
                <div>
                  <p className="text-[11px] text-white/60">You will receive</p>
                  <p className="mt-[3px] text-[15px] font-medium">{data.next.payout}</p>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] leading-normal text-white/80">{data.next.meeting}</p>
              <Link
                href={data.next.href}
                className="mt-3.5 flex h-10 w-full items-center justify-center rounded-full bg-white text-[13px] font-medium text-[#2C0101]"
              >
                See the guest list
              </Link>
            </section>
          )}

          <section className={cn(CARD, "p-[18px]")}>
            <h2 className="mb-3.5 text-sm font-medium text-[#333134]">Recent reviews</h2>
            <div className="flex flex-col gap-3.5">
              {data.reviews.map((review) => (
                <div key={review.name + review.when}>
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium text-[#333134]">{review.name}</span>
                    <span aria-label={`${review.stars} stars`} className="text-xs text-[#F5032D]">
                      {"★".repeat(review.stars)}
                    </span>
                    <span className="ml-auto text-[11.5px] text-[#6F6B72]">{review.when}</span>
                  </div>
                  <p className="mt-[5px] text-[13px] leading-[1.55] text-[#6F6B72]">{review.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-[#F4F2EE] p-[18px]">
            <h2 className="mb-3 text-sm font-medium text-[#333134]">Quick actions</h2>
            <div className="flex flex-col gap-[7px]">
              {vm.quick.map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  className="flex h-10 items-center gap-2.5 rounded-full bg-white px-[13px] text-[13px] font-medium text-[#333134] hover:bg-[#FAF9F7]"
                >
                  <span>{q.label}</span>
                  <ChevronRight aria-hidden className="ml-auto size-[15px] text-[#6F6B72]" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function EmptyHome({ vm }: { vm: HostHomeViewModel }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FCFCFC] px-7 pt-9 pb-[90px]">
      <div className="mx-auto max-w-[940px]">
        <section className="mb-[34px] flex flex-col items-center gap-7 rounded-2xl bg-[#F4F2EE] px-8 py-[30px] md:flex-row">
          <div className="min-w-0 flex-1">
            <p className={EYEBROW}>{vm.pitch.eyebrow}</p>
            <h2 className="mt-2.5 mb-2.5 font-heading text-[30px] leading-[1.2] font-extrabold text-balance text-[#333134]">
              {vm.pitch.heading}
            </h2>
            <p className="mb-5 max-w-[520px] text-[15.5px] leading-[1.6] text-pretty text-[#6F6B72]">{vm.pitch.body}</p>
            <Link
              href={vm.newListingHref}
              className="inline-flex h-12 items-center rounded-full bg-[#F5032D] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#FF4540]"
            >
              {vm.pitch.cta}
            </Link>
          </div>
          <div className="relative h-[190px] w-full shrink-0 overflow-hidden rounded-2xl md:w-[260px]">
            <Image src="/images/home/cities/lagos.jpg" alt="" fill sizes="260px" className="object-cover" />
          </div>
        </section>

        <h2 className="mb-1.5 text-base font-medium text-[#333134]">{vm.examples.heading}</h2>
        <p className="mb-4 text-[13.5px] text-[#6F6B72]">{vm.examples.body}</p>
        <div className="mb-[34px] grid gap-4 md:grid-cols-3">
          {vm.examples.items.map((example) => (
            <div key={example.title} className={cn(CARD, "flex flex-col overflow-hidden")}>
              <div className="relative h-[132px] w-full">
                <Image src={example.imageUrl} alt="" fill sizes="300px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-[15px]">
                <p className={EYEBROW}>{example.eyebrow}</p>
                <p className="mt-[7px] text-[15px] leading-[1.3] font-medium text-[#333134]">{example.title}</p>
                <p className="mt-1.5 text-[13px] leading-normal text-pretty text-[#6F6B72]">{example.sub}</p>
                <p className="mt-2.5 text-[13px] font-medium text-[#333134]">{example.money}</p>
                <Link
                  href={vm.newListingHref}
                  className="mt-3.5 flex h-10 items-center justify-center rounded-full bg-white text-[13px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] hover:bg-[#F5F5F5]"
                >
                  Start from this
                </Link>
              </div>
            </div>
          ))}
        </div>

        <section className={cn(CARD, "px-[26px] py-6")}>
          <h2 className="mb-[18px] text-base font-medium text-[#333134]">What makes one sell</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {vm.sellPoints.map((point) => (
              <div key={point.n}>
                <div className="mb-3 flex size-[34px] items-center justify-center rounded-[14px] bg-[#F5F3EF] font-heading text-sm font-extrabold text-[#333134]">
                  {point.n}
                </div>
                <h3 className="mb-1.5 text-sm font-medium text-[#333134]">{point.title}</h3>
                <p className="text-[13px] leading-[1.6] text-pretty text-[#6F6B72]">{point.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Figma / handoff "Listing Builder" prototype, Home: the populated dashboard,
// and the screen a newly approved host sees before they have listed anything.
export function HostHomeView(vm: HostHomeViewModel) {
  return vm.kind === "full" ? <FullHome vm={vm} data={vm.data} /> : <EmptyHome vm={vm} />;
}
