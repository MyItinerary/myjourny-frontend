import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { HostProfileViewModel } from "../view-model/use-host-profile-view-model";
import { StatusChip } from "./host-booking-parts";

const CARD = "rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";
const HEADING = "text-[14.5px] font-medium text-[#333134]";
const SMALL_BUTTON =
  "h-8 cursor-pointer rounded-full bg-white px-[13px] text-[12.5px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]";

export function SetupCard({ setup }: { setup: NonNullable<HostProfileViewModel["setup"]> }) {
  return (
    <section className="mb-7 rounded-2xl bg-[#F4F2EE] px-[22px] py-5">
      <div className="mb-1.5 flex items-center gap-3.5">
        <h3 className="text-[15px] font-medium text-[#333134]">Finish setting up</h3>
        <span className="ml-auto text-[12.5px] text-[#6F6B72]">{setup.count}</span>
      </div>
      <p className="mb-3.5 text-[13.5px] leading-[1.55] text-[#6F6B72]">{setup.note}</p>
      <div className="mb-4 h-[5px] overflow-hidden rounded-full bg-[#E9E1D2]">
        <div className="h-full rounded-full bg-[#F5032D]" style={{ width: `${setup.percent}%` }} />
      </div>
      <div className="flex flex-col gap-2">
        {setup.tasks.map((task) => (
          <button
            key={task.title}
            type="button"
            onClick={task.onOpen}
            className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] bg-white px-3.5 py-[13px] text-left hover:bg-[#FAF9F7]"
          >
            <span
              aria-hidden
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] text-white",
                task.done ? "bg-[#0CBA65]" : "shadow-[inset_0_0_0_1.5px_#D9D9D9]",
              )}
            >
              {task.done ? "✓" : ""}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-[#333134]">{task.title}</span>
              <span className="mt-0.5 block text-[12.5px] leading-normal text-[#6F6B72]">{task.body}</span>
            </span>
            <ChevronRight aria-hidden className="size-4 shrink-0 text-[#6F6B72]" strokeWidth={1.9} />
          </button>
        ))}
      </div>
    </section>
  );
}

export function RowList({ vm }: { vm: HostProfileViewModel }) {
  return (
    <>
      {vm.rows.map((row) => (
        <div key={row.label} className="flex items-start gap-[18px] py-5 shadow-[inset_0_-1px_0_#F0F0F0]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[14.5px] font-medium text-[#333134]">{row.label}</span>
              {row.chip && <StatusChip status={row.chip.kind} label={row.chip.text} />}
            </div>
            <p className={cn("mt-[5px] text-[13.5px] leading-[1.55]", row.muted ? "text-[#A09DA3]" : "text-[#6F6B72]")}>{row.value}</p>
            {row.help && <p className="mt-1.5 max-w-[420px] text-[12.5px] leading-[1.55] text-pretty text-[#A09DA3]">{row.help}</p>}
          </div>
          <button
            type="button"
            onClick={() => vm.onRowAction(row)}
            className="shrink-0 cursor-pointer text-[13.5px] font-medium text-[#333134] underline"
          >
            {row.action}
          </button>
        </div>
      ))}
    </>
  );
}

export function PreviewCard({ preview }: { preview: NonNullable<HostProfileViewModel["preview"]> }) {
  return (
    <section className="mt-7 rounded-2xl bg-[#FAF9F7] p-5 shadow-[inset_0_0_0_1px_#E9E1D2]">
      <h3 className="mb-3.5 text-[12.5px] font-medium text-[#333134]">What a guest sees</h3>
      <div className={cn(CARD, "p-[18px]")}>
        <div className="flex items-center gap-[13px]">
          <span aria-hidden className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F4F2EE] font-heading text-lg font-extrabold text-[#333134]">
            {preview.name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
          </span>
          <div>
            <p className="font-heading text-lg font-extrabold text-[#333134]">{preview.name}</p>
            <p className="mt-[3px] text-[12.5px] text-[#6F6B72]">{preview.line}</p>
          </div>
        </div>
        {preview.badges.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {preview.badges.map((badge, i) => (
              <span
                key={badge}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  i === 0 ? "bg-[#F0FCF5] text-[#0CBA65]" : "bg-[#F5F3EF] text-[#6F6B72]",
                )}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        <p className="mt-4 text-[13.5px] leading-[1.65] text-pretty text-[#333134]">{preview.bio}</p>
        <p className="mt-3.5 border-t border-[#E7E7E7] pt-3.5 text-[12.5px] text-[#6F6B72]">Speaks {preview.languages}</p>
      </div>
    </section>
  );
}

export function NotificationsTable({ notifications }: { notifications: NonNullable<HostProfileViewModel["notifications"]> }) {
  const width = (c: number) => (c === 0 ? "w-[74px]" : "w-[58px]");
  return (
    <div>
      <div className={cn(CARD, "mb-[22px] overflow-hidden")}>
        <div className="flex h-10 items-center px-[18px] text-[11.5px] font-medium text-[#6F6B72] shadow-[inset_0_-1px_0_#F0F0F0]">
          <span className="flex-1">What happens</span>
          {notifications.channels.map((channel, c) => (
            <span key={channel} className={cn(width(c), "shrink-0 text-center")}>{channel}</span>
          ))}
        </div>
        {notifications.rows.map((row, r) => (
          <div key={row.label} className="flex h-[52px] items-center px-[18px] shadow-[inset_0_-1px_0_#F0F0F0]">
            <span className="flex-1 text-[13.5px] text-[#333134]">{row.label}</span>
            {row.cells.map((cell, c) => (
              <span key={c} className={cn(width(c), "flex shrink-0 justify-center")}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={cell.on}
                  aria-disabled={cell.locked}
                  aria-label={`${row.label}, ${notifications.channels[c]}`}
                  onClick={() => notifications.onToggle(r, c)}
                  className={cn(
                    "flex size-[19px] items-center justify-center rounded-md text-[11px] text-white",
                    cell.locked ? "cursor-not-allowed" : "cursor-pointer",
                    cell.on
                      ? cell.locked
                        ? "bg-[#BDBDBD] shadow-[inset_0_0_0_1.5px_#BDBDBD]"
                        : "bg-[#F5032D] shadow-[inset_0_0_0_1.5px_#F5032D]"
                      : "bg-white shadow-[inset_0_0_0_1.5px_#D9D9D9]",
                  )}
                >
                  {cell.on ? "✓" : ""}
                </button>
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="text-[12.5px] leading-[1.6] text-[#A09DA3]">{notifications.note}</p>
    </div>
  );
}

export function PayoutsSection({ payouts }: { payouts: NonNullable<HostProfileViewModel["payouts"]> }) {
  return (
    <div className="mt-[26px]">
      <h3 className={cn(HEADING, "mb-2.5")}>How you are paid</h3>
      <div role="radiogroup" aria-label="How you are paid" className="mb-[26px] flex flex-col gap-[9px]">
        {payouts.schedules.map((s) => (
          <button
            key={s.key}
            type="button"
            role="radio"
            aria-checked={s.selected}
            onClick={() => payouts.onSchedule(s.key)}
            className={cn(
              "flex w-full cursor-pointer items-start gap-[11px] rounded-xl bg-white p-3.5 text-left",
              s.selected ? "shadow-[inset_0_0_0_2px_#F5032D]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-px size-[18px] shrink-0 rounded-full",
                s.selected ? "shadow-[inset_0_0_0_5.5px_#F5032D]" : "shadow-[inset_0_0_0_1.5px_#D2D2D2]",
              )}
            />
            <span className="flex-1">
              <span className="mb-[3px] block text-[13.5px] font-medium text-[#333134]">{s.label}</span>
              <span className="block text-[12.5px] leading-normal text-[#6F6B72]">{s.sub}</span>
            </span>
          </button>
        ))}
      </div>

      <h3 className={cn(HEADING, "mb-2.5")}>Currency</h3>
      <div className={cn(CARD, "mb-2.5 flex items-center gap-3 px-[18px] py-4")}>
        <span className="font-heading text-lg font-extrabold text-[#333134]">₦</span>
        <div>
          <p className="text-[13.5px] font-medium text-[#333134]">Naira</p>
          <p className="mt-0.5 text-[12.5px] text-[#6F6B72]">Guests pay in Naira, you are paid in Naira. Nothing is converted.</p>
        </div>
        <span className="ml-auto rounded-full bg-[#F0FCF5] px-[9px] py-[3px] text-[11px] font-medium text-[#0CBA65]">In use</span>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-[#FAF9F7] px-[18px] py-4 shadow-[inset_0_0_0_1px_#E7E7E7]">
        <span className="font-heading text-lg font-extrabold text-[#BDBDBD]">$</span>
        <div>
          <p className="text-[13.5px] font-medium text-[#6F6B72]">Dollars and other currencies</p>
          <p className="mt-0.5 text-[12.5px] text-[#A09DA3]">We are not paying out in anything but Naira yet. We will tell you the week it changes.</p>
        </div>
        <span className="ml-auto rounded-full bg-[#EEEEEE] px-[9px] py-[3px] text-[11px] font-medium text-[#6F6B72]">Coming later</span>
      </div>
    </div>
  );
}

export function TaxSection({ tax }: { tax: NonNullable<HostProfileViewModel["tax"]> }) {
  return (
    <div className="mt-[26px]">
      <h3 className={cn(HEADING, "mb-2.5")}>Yearly statements</h3>
      <div className={cn(CARD, "mb-[26px] overflow-hidden")}>
        {tax.statements.map((s) => (
          <div key={s.year} className="flex items-center gap-3 px-[18px] py-3.5 shadow-[inset_0_-1px_0_#F0F0F0] last:shadow-none">
            <div className="flex-1">
              <p className="text-[13.5px] font-medium text-[#333134]">{s.year}</p>
              <p className="mt-0.5 text-xs text-[#6F6B72]">{s.sub}</p>
            </div>
            <button type="button" onClick={tax.onAction} className={SMALL_BUTTON}>Download</button>
          </div>
        ))}
      </div>

      <h3 className={cn(HEADING, "mb-2.5")}>What you sent us</h3>
      <div className={cn(CARD, "overflow-hidden")}>
        {tax.documents.map((d) => (
          <div key={d.name} className="flex items-center gap-3 px-[18px] py-3.5 shadow-[inset_0_-1px_0_#F0F0F0] last:shadow-none">
            <div className="flex-1">
              <p className="text-[13.5px] font-medium text-[#333134]">{d.name}</p>
              <p className="mt-0.5 text-xs text-[#6F6B72]">{d.sub}</p>
            </div>
            <StatusChip status={d.checked ? "Live" : "Draft"} label={d.checked ? "Checked" : "Not sent"} />
            <button type="button" onClick={tax.onAction} className={SMALL_BUTTON}>{d.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DangerCard({ danger }: { danger: NonNullable<HostProfileViewModel["danger"]> }) {
  return (
    <section className="mt-[26px] rounded-2xl bg-[#FEF2F3] p-5 shadow-[inset_0_0_0_1px_#FACDD3]">
      <h3 className={cn(HEADING, "mb-2")}>Close your account</h3>
      <p className="mb-4 text-[13px] leading-[1.6] text-pretty text-[#6F6B72]">{danger.text}</p>
      <button
        type="button"
        onClick={danger.onStart}
        className="h-10 cursor-pointer rounded-full bg-white px-4 text-[13px] font-medium text-[#F5032D] shadow-[inset_0_0_0_1px_#FACDD3]"
      >
        Start closing my account
      </button>
    </section>
  );
}

