import { ArrowLeft, Check, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostListingDetailViewModel } from "../view-model/use-host-listing-detail-view-model";

const TONE = {
  amber: "bg-[#FDF7EB] shadow-[inset_0_0_0_1px_#E9E1D2]",
  grey: "bg-[#F5F5F5] shadow-[inset_0_0_0_1px_#E7E7E7]",
  blue: "bg-[#F0F6FF] shadow-[inset_0_0_0_1px_#CDDEFA]",
  red: "bg-[#FEF2F3] shadow-[inset_0_0_0_1px_#FACDD3]",
};

const card = "rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";

export function HostListingDetailView({ vm }: { vm: HostListingDetailViewModel }) {
  const { listing, detail } = vm;
  if (!listing || !detail) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#FCFCFC] p-10">
        <h2 className="font-heading text-2xl font-extrabold text-[#333134]">We couldn&apos;t find that listing</h2>
        <p className="mt-2 text-sm text-[#6F6B72]">It may have been deleted, or it isn&apos;t yours.</p>
        <Link href={vm.listingsHref} className="mt-5 inline-flex h-11 items-center rounded-full bg-[#F5032D] px-5 text-sm font-medium text-white">
          Back to your listings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#FCFCFC] px-4 pt-[18px] pb-24 md:px-7">
      <Link href={vm.listingsHref} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6F6B72] hover:text-[#333134]">
        <ArrowLeft className="size-4" />
        All listings
      </Link>

      {vm.banner && (
        <div className={cn("mb-[18px] flex flex-wrap items-center gap-4 rounded-2xl px-[18px] py-[15px]", TONE[vm.banner.tone])}>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-medium">{vm.banner.title}</div>
            <p className="mt-[3px] text-[12.5px] leading-relaxed text-pretty text-[#6F6B72]">{vm.banner.body}</p>
          </div>
          <button type="button" onClick={vm.banner.onButton} className="h-9 shrink-0 cursor-pointer rounded-full bg-white px-[15px] text-[13px] font-medium shadow-[inset_0_0_0_1px_#E7E7E7]">
            {vm.banner.button}
          </button>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {vm.stats.map((s) => (
          <div key={s.label} className={cn(card, "px-[18px] py-4")}>
            <div className="text-[12.5px] text-[#6F6B72]">{s.label}</div>
            <div className="mt-2 font-heading text-2xl leading-tight font-extrabold">{s.value}</div>
            <div className="mt-1.5 text-xs text-[#6F6B72]">{s.note}</div>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <section aria-label="Coming up" className={cn(card, "overflow-hidden")}>
            <div className="flex items-center gap-2.5 px-[18px] py-[15px] shadow-[inset_0_-1px_0_#E7E7E7]">
              <h2 className="text-sm font-medium">Coming up</h2>
              <span className="text-[12.5px] text-[#6F6B72]">{detail.cadence}</span>
              <Link href={vm.calendarHref} className="ml-auto text-[12.5px] font-medium text-[#F5032D]">Open the calendar</Link>
            </div>
            {vm.dates.length === 0 && <p className="px-[18px] py-[26px] text-[13px] leading-relaxed text-[#6F6B72]">{detail.noDates}</p>}
            {vm.dates.map((d) => (
              <div key={d.date} className="flex flex-wrap items-center gap-3.5 px-[18px] py-[13px] shadow-[inset_0_-1px_0_#F0F0F0]">
                <div className="w-[150px] shrink-0">
                  <div className="text-[13.5px] font-medium">{d.date}</div>
                  <div className="mt-px text-xs text-[#6F6B72]">{d.when}</div>
                </div>
                <div className="min-w-[120px] flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#F0F0F0]">
                    <div className={cn("h-full rounded-full", d.full ? "bg-[#3086FF]" : "bg-[#F5032D]")} style={{ width: `${d.percent}%` }} />
                  </div>
                  <div className="mt-1.5 text-xs text-[#6F6B72]">{d.seats}</div>
                </div>
                <span className={cn("rounded-full px-[9px] py-[3px] text-[11px] font-medium", d.full ? "bg-[#F0F6FF] text-[#3086FF]" : "bg-[#F0FCF5] text-[#0CBA65]")}>
                  {d.full ? "Sold out" : "Open"}
                </span>
                <button type="button" onClick={d.onGuests} aria-label={`See guests for ${d.date}`} className="h-8 shrink-0 cursor-pointer rounded-full bg-white px-[13px] text-[12.5px] font-medium shadow-[inset_0_0_0_1px_#E7E7E7]">
                  See guests
                </button>
              </div>
            ))}
          </section>

          <section className={cn(card, "overflow-hidden")}>
            <div role="tablist" className="flex gap-0.5 px-2.5 pt-1 shadow-[inset_0_-1px_0_#E7E7E7]">
              {vm.tabs.map((t) => (
                <button
                  key={t.tab}
                  type="button"
                  role="tab"
                  aria-selected={t.active}
                  onClick={t.onSelect}
                  className={cn("h-10 cursor-pointer px-3.5 text-[13px] font-medium", t.active ? "text-[#333134] shadow-[inset_0_-2px_0_#F5032D]" : "text-[#6F6B72]")}
                >
                  {t.tab}
                </button>
              ))}
            </div>

            {vm.tab === "About" && (
              <div className="p-5">
                <div className="mb-[18px] flex flex-col gap-4 sm:flex-row">
                  <span className="relative h-[132px] w-full shrink-0 overflow-hidden rounded-[14px] bg-muted sm:w-[200px]">
                    <Image src={listing.imageUrl} alt="" fill sizes="200px" className="object-cover" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium tracking-[0.06em] text-[#F5032D] uppercase">{listing.cat}</div>
                    <div className="mt-1.5 font-heading text-[19px] leading-tight font-extrabold">{listing.title}</div>
                    <p className="mt-1 text-[13px] leading-normal text-pretty text-[#6F6B72]">{detail.hook}</p>
                  </div>
                </div>
                <p className="mb-[18px] text-[13.5px] leading-[1.7] text-pretty text-[#333134]">{detail.desc}</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <LineBlock title="Included" lines={detail.inc} ok />
                  <LineBlock title="Not included" lines={detail.exc} ok={false} />
                </div>
              </div>
            )}

            {vm.tab === "Reviews" && (
              <div className="px-5 pt-1.5 pb-2">
                {vm.reviews.length === 0 && <p className="py-[26px] text-[13px] text-[#6F6B72]">{detail.noReviews}</p>}
                {vm.reviews.map((r) => (
                  <div key={r.name} className="py-3.5 shadow-[inset_0_-1px_0_#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium">{r.name}</span>
                      <span aria-label={`${r.stars.length} out of 5`} className="text-xs text-[#F5032D]">{r.stars}</span>
                      <span className="ml-auto text-[11.5px] text-[#6F6B72]">{r.when}</span>
                    </div>
                    <p className="mt-[5px] text-[13px] leading-relaxed text-pretty text-[#6F6B72]">{r.text}</p>
                  </div>
                ))}
              </div>
            )}

            {vm.tab === "Rules and settings" && (
              <dl className="px-5 pt-1.5 pb-2">
                {vm.rules.map((r) => (
                  <div key={r.label} className="flex gap-4 py-[13px] shadow-[inset_0_-1px_0_#F0F0F0]">
                    <dt className="w-[130px] shrink-0 text-[13px] text-[#6F6B72] sm:w-[170px]">{r.label}</dt>
                    <dd className="text-[13px] leading-normal text-pretty">{r.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <section aria-label="Next date" className="rounded-2xl bg-[#2C0101] p-[18px] text-white">
            <div className="text-[11px] font-medium tracking-[0.06em] text-white/60 uppercase">Next date</div>
            <div className="mt-2 font-heading text-[19px] leading-tight font-extrabold">{vm.next?.title ?? "Nothing coming up"}</div>
            <div className="mt-[5px] text-[13px] text-white/80">{vm.next?.meta ?? detail.cadence}</div>
            {vm.next && (
              <>
                <div className="mt-3.5 text-[12.5px] leading-normal text-white/80">Meeting at {vm.next.cue}</div>
                <button type="button" onClick={vm.next.onGuests} className="mt-3.5 h-10 w-full cursor-pointer rounded-full bg-white text-[13px] font-medium text-[#2C0101]">
                  See the guest list
                </button>
              </>
            )}
          </section>

          <section aria-label="What one full group pays you" className={cn(card, "p-[18px]")}>
            <h2 className="mb-3.5 text-sm font-medium">What one full group pays you</h2>
            <dl className="flex flex-col gap-[9px] text-[13.5px]">
              <div className="flex"><dt className="text-[#6F6B72]">{vm.pay.line}</dt><dd className="ml-auto font-medium">{vm.pay.gross}</dd></div>
              <div className="flex"><dt className="text-[#6F6B72]">Our commission, {vm.pay.percent} percent</dt><dd className="ml-auto font-medium">- {vm.pay.commission}</dd></div>
              <div className="flex pt-[9px] shadow-[inset_0_1px_0_#F0F0F0]"><dt className="font-medium">You keep</dt><dd className="ml-auto font-medium text-[#F5032D]">{vm.pay.net}</dd></div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-[#6F6B72]">{detail.payNote}</p>
          </section>

          <section aria-label="Where you meet" className={cn(card, "p-[18px]")}>
            <h2 className="mb-3 text-sm font-medium">Where you meet</h2>
            <div className="flex gap-[11px]">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image src={listing.imageUrl} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium">{vm.meetCue}</div>
                <div className="mt-[3px] text-[12.5px] text-[#6F6B72]">{detail.area}</div>
              </div>
            </div>
          </section>

          <section aria-label="Manage this listing" className="rounded-2xl bg-[#F4F2EE] p-[18px]">
            <h2 className="mb-3 text-sm font-medium">Manage this listing</h2>
            <div className="flex flex-col gap-[7px]">
              {vm.actions.map((a) => (
                <button key={a.label} type="button" onClick={a.onClick} className="flex h-10 cursor-pointer items-center gap-2.5 rounded-full bg-white px-[13px] text-left text-[13px] font-medium hover:brightness-[0.98]">
                  {a.label}
                  <ChevronRight className="ml-auto size-4 text-[#6F6B72]" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function LineBlock({ title, lines, ok }: { title: string; lines: string[]; ok: boolean }) {
  return (
    <div>
      <div className="mb-2 text-[12.5px] font-medium">{title}</div>
      {lines.map((line) => (
        <div key={line} className="mb-1.5 flex gap-2 text-[13px] leading-normal text-[#6F6B72]">
          {ok ? <Check className="mt-0.5 size-4 shrink-0 text-[#0CBA65]" /> : <X className="mt-0.5 size-4 shrink-0 text-[#A09DA3]" />}
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}
