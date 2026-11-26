import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { DateField } from "./host-builder-date-field-view";
import { Field, inputClass, LineList, Pill, StepHeading, TimeSelect } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

const numeric = (value: string) => value.replace(/[^\d]/g, "");

/** A start time and an end time, side by side. The end can't be picked before the start. */
function StartEnd({ vm }: Props) {
  const { hours, times } = vm.derived;
  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1">
        <span className="mb-1.5 block text-base font-medium text-[#333134]">Start time</span>
        <TimeSelect label="Start time" value={hours.start} options={times.choices(hours.start)} format={times.format} onChange={hours.onStart} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="mb-1.5 block text-base font-medium text-[#333134]">End time</span>
        <TimeSelect label="End time" value={hours.end} options={times.choices(hours.end)} format={times.format} onChange={hours.onEnd} disabled={!hours.start} />
      </div>
    </div>
  );
}

export function StepWhen({ vm }: Props) {
  const { draft, options, derived, onField, onToggle } = vm;
  return (
    <div>
      <StepHeading
        badge="Required"
        title="Date and time"
        intro="Select the date and time of this experience. You can also block dates from your calendar."
      />
      <div className="mb-[26px] flex gap-2">
        {options.whenTypes.map((w) => (
          <button
            key={w.key}
            type="button"
            aria-pressed={draft.whenType === w.key}
            onClick={() => onField("whenType", w.key)}
            className={cn(
              "flex-1 cursor-pointer rounded-xl bg-white p-3.5 text-left hover:shadow-[inset_0_0_0_2px_#FF4540]",
              draft.whenType === w.key ? "shadow-[inset_0_0_0_2px_#F5032D]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
            )}
          >
            <div className="mb-[3px] text-[13.5px] font-medium">{w.label}</div>
            <div className="text-xs leading-snug text-[#6F6B72]">{w.sub}</div>
          </button>
        ))}
      </div>

      {draft.whenType === "recurring" && (
        <div>
          <div className="mb-2.5 text-base font-medium text-[#333134]">Which days</div>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {options.weekDays.map((d) => (
              <Pill key={d} on={draft.days.includes(d)} onClick={() => onToggle("days", d)} className="h-[38px] w-11 rounded-xl px-0">
                {d}
              </Pill>
            ))}
          </div>
          <div className="mb-2.5 text-base font-medium text-[#333134]">How often</div>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {vm.howOften.map((e) => (
              <Pill key={e.key} on={e.selected} onClick={e.onPick}>
                {e.label}
              </Pill>
            ))}
          </div>
          <div className="mb-6">
            <StartEnd vm={vm} />
          </div>
          <div className="mb-[26px]">
            <span className="mb-1.5 block text-base font-medium text-[#333134]">Repeat until</span>
            <DateField label="Repeat until" field={derived.until} />
          </div>
          <div className="rounded-[14px] bg-[#F4F2EE] p-4">
            <div className="mb-1 text-[13px] font-medium">Preview</div>
            <div className="mb-3 text-[13px] text-[#6F6B72]">{derived.slotSummary} · next five dates</div>
            <ul className="flex flex-col gap-[7px]">
              {derived.upcoming.map((label) => (
                <li key={label} className="flex items-center gap-2 text-[13px]">
                  <span aria-hidden className="size-1.5 rounded-full bg-[#F5032D]" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {draft.whenType === "once" && (
        <div className="flex flex-col gap-[22px]">
          <div>
            <span className="mb-1.5 block text-base font-medium text-[#333134]">Date</span>
            <DateField label="Date" field={derived.date} />
          </div>
          <StartEnd vm={vm} />
        </div>
      )}

      {draft.whenType === "request" && (
        <div className="rounded-[14px] bg-[#FAF9F7] p-4 text-[13px] leading-[1.6] text-[#6F6B72] shadow-[inset_0_0_0_1px_#E9E1D2]">
          Guests send you a request, and we email it to you with their contact details. It&apos;s important you reply within 24 hours.
        </div>
      )}
    </div>
  );
}

export function StepPrice({ vm }: Props) {
  const { draft, derived, privateGroup, onField } = vm;
  const money = (key: "price" | "priv", label: string, placeholder: string) => (
    <Field label={label}>
      <div className="relative">
        <span className="pointer-events-none absolute top-3.5 left-3.5 text-[15px] text-[#6F6B72]">₦</span>
        <input inputMode="numeric" value={draft[key]} placeholder={placeholder} onChange={(e) => onField(key, numeric(e.target.value))} className={`${inputClass} pl-8`} />
      </div>
    </Field>
  );
  return (
    <div>
      <StepHeading badge="Required" title="Group size and price" />
      <div className="flex gap-3">
        <Field label="Minimum guests" className="flex-1">
          <input inputMode="numeric" value={draft.minG} placeholder="2" onChange={(e) => onField("minG", numeric(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Maximum guests" className="flex-1">
          <input inputMode="numeric" value={draft.maxG} placeholder="8" onChange={(e) => onField("maxG", numeric(e.target.value))} className={inputClass} />
        </Field>
      </div>
      {money("price", "Price per person", "10,000")}
      <div className="mb-[26px]">
        <div className="mb-2 text-base font-medium text-[#333134]">Do you want to include a private group option?</div>
        <div className="flex gap-2">
          <Pill on={privateGroup.on} onClick={() => privateGroup.onChange(true)}>Yes</Pill>
          <Pill on={!privateGroup.on} onClick={() => privateGroup.onChange(false)}>No</Pill>
        </div>
        {privateGroup.on && (
          <div className="mt-4">
            {money("priv", "Price for the private group", "50,000")}
          </div>
        )}
      </div>
      <div className="rounded-2xl bg-[#F4F2EE] p-[18px]">
        <div className="mb-3 text-[11px] font-medium tracking-[0.06em] text-[#6F6B72] uppercase">A full group</div>
        <div className="mb-3.5 font-heading text-2xl leading-tight font-extrabold">{derived.price.line}</div>
        <dl className="flex flex-col gap-2 text-[13.5px]">
          <div className="flex justify-between"><dt className="text-[#6F6B72]">Guests pay</dt><dd className="font-medium">{derived.price.gross}</dd></div>
          <div className="flex justify-between"><dt className="text-[#6F6B72]">Our commission, {derived.commissionPercent} percent</dt><dd className="font-medium">- {derived.price.commission}</dd></div>
          <div className="flex justify-between border-t border-[#E9E1D2] pt-2 font-medium"><dt>You keep</dt><dd className="text-[#F5032D]">{derived.price.net}</dd></div>
        </dl>
        <p className="mt-3 text-xs leading-[1.55] text-[#6F6B72]">
          That is {derived.price.perSeat} per seat, in your bank within 24 hours of the walk finishing. No listing fee, nothing else taken.
        </p>
      </div>
      <p className="mt-6 rounded-[14px] bg-[#FAF9F7] p-4 text-[13px] leading-[1.6] text-[#6F6B72] shadow-[inset_0_0_0_1px_#E9E1D2]">
        Our cancellation policy lets guests cancel up to 24 hours before the experience and get a full refund.{" "}
        <Link href="/legal/cancellations" className="font-medium text-[#F5032D] underline underline-offset-2">
          Read the cancellation policy
        </Link>
      </p>
    </div>
  );
}

export function StepIncluded({ vm }: Props) {
  const { draft, onListSet, onListAdd, onListDel } = vm;
  const list = (key: "inc" | "exc" | "bring" | "wear", title: string, label: string, placeholder: string, maxLength: number) => (
    <LineList
      title={title}
      label={label}
      lines={draft[key]}
      placeholder={placeholder}
      maxLength={maxLength}
      max={12}
      onSet={(i, v) => onListSet(key, i, v)}
      onAdd={() => onListAdd(key)}
      onDel={(i) => onListDel(key, i)}
    />
  );
  return (
    <div>
      <StepHeading
        title="What's included"
        intro="Tell guests what's included, what isn't, what to bring and what to wear. Add one item per line."
      />
      {list("inc", "Included", "Included line", "Ten edited photos within five days", 100)}
      {list("exc", "Not included", "Not included line", "Transport to the meeting point", 100)}
      {list("bring", "What to bring", "Bring line", "Shoes you can walk in", 80)}
      {list("wear", "What to wear", "Wear line", "Something you do not mind sweating in", 80)}
    </div>
  );
}
