import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { ChoiceCard, Field, inputClass, LineList, Pill, StepHeading, TimeSelect } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

const numeric = (value: string) => value.replace(/[^\d]/g, "");

export function StepWhen({ vm }: Props) {
  const { draft, options, derived, onField, onToggle, onListSet, onListAdd, onListDel } = vm;
  const { times } = derived;
  return (
    <div>
      <StepHeading
        badge="Required"
        title="When it runs"
        intro="Pick the shape of your schedule. You can block single dates later from your calendar without touching this."
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
          <div className="mb-2.5 text-[13px] font-medium">Which days</div>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {options.weekDays.map((d) => (
              <Pill key={d} on={draft.days.includes(d)} onClick={() => onToggle("days", d)} className="h-[38px] w-11 rounded-xl px-0">
                {d}
              </Pill>
            ))}
          </div>
          <div className="mb-2.5 text-[13px] font-medium">How often</div>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {options.everyOptions.map((e) => (
              <Pill key={e.value} on={draft.every === e.value} onClick={() => onField("every", e.value)}>
                {e.label}
              </Pill>
            ))}
          </div>
          <div className="mb-6 flex gap-3">
            <Field label="How long it lasts" className="mb-0 flex-1">
              <div className="relative">
                <input inputMode="numeric" value={draft.dur} onChange={(e) => onField("dur", numeric(e.target.value))} className={`${inputClass} pr-16`} />
                <span className="pointer-events-none absolute top-[15px] right-3.5 text-[13px] text-[#6F6B72]">hours</span>
              </div>
            </Field>
            <Field label="Repeat until" className="mb-0 flex-1">
              <input type="date" aria-label="Repeat until" value={draft.until} onChange={(e) => onField("until", e.target.value)} className={cn(inputClass, "accent-[#F5032D]")} />
            </Field>
          </div>
          <div className="mb-2 text-[13px] font-medium">Start times</div>
          <div className="mb-2.5 flex flex-col gap-2">
            {draft.slots.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <TimeSelect
                  className="w-[150px] shrink-0"
                  label={`Start time ${i + 1}`}
                  value={t}
                  options={times.choices(t)}
                  format={times.format}
                  onChange={(v) => onListSet("slots", i, v)}
                />
                <span className="text-[13px] text-[#6F6B72]">{times.range(t)}</span>
                <button type="button" aria-label={`Remove start time ${i + 1}`} onClick={() => onListDel("slots", i)} className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-full text-[#6F6B72] hover:bg-[#F5F5F5]">
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onListAdd("slots")} className="mb-[26px] h-[38px] cursor-pointer rounded-full px-3.5 text-[13px] font-medium shadow-[inset_0_0_0_1px_#E7E7E7] hover:bg-[#F5F5F5]">
            Add another start time
          </button>
          <div className="rounded-[14px] bg-[#F4F2EE] p-4">
            <div className="mb-1 text-[13px] font-medium">This is what you just made</div>
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
        <div className="flex gap-3">
          <Field label="Date" className="mb-0 flex-1">
            <input type="date" aria-label="Date" value={draft.date} onChange={(e) => onField("date", e.target.value)} className={cn(inputClass, "accent-[#F5032D]")} />
          </Field>
          <div className="flex-1">
            <span className="mb-1.5 block text-[13px] font-medium">Start time</span>
            <TimeSelect label="Start time" value={draft.slots[0] ?? ""} options={times.choices(draft.slots[0] ?? "")} format={times.format} onChange={(v) => onField("slots", [v])} />
          </div>
        </div>
      )}

      {draft.whenType === "request" && (
        <div className="rounded-[14px] bg-[#FAF9F7] p-4 text-[13px] leading-[1.6] text-[#6F6B72] shadow-[inset_0_0_0_1px_#E9E1D2]">
          Guests will ask for a date and you reply with what works. Fewer bookings come in this way, but you keep every weekend free until you say yes. You still need to answer within 24 hours.
        </div>
      )}
    </div>
  );
}

export function StepPrice({ vm }: Props) {
  const { draft, derived, options, privateGroup, onField } = vm;
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
        <Field label="Smallest group you will run" className="flex-1">
          <input inputMode="numeric" value={draft.minG} placeholder="2" onChange={(e) => onField("minG", numeric(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Most you can handle" className="flex-1">
          <input inputMode="numeric" value={draft.maxG} placeholder="8" onChange={(e) => onField("maxG", numeric(e.target.value))} className={inputClass} />
        </Field>
      </div>
      {money("price", "Price per person", "10,000")}
      <div className="mb-[26px]">
        <div className="mb-2 text-[13px] font-medium">Do you want to include a private group option?</div>
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
      <div className="mt-6 mb-2.5 text-[13px] font-medium">If a guest cancels</div>
      <div className="mb-3 flex flex-col gap-2">
        {options.refundPolicies.map((r) => (
          <ChoiceCard key={r.key} radio selected={draft.refund === r.key} onClick={() => onField("refund", r.key)}>
            <span className="text-[13.5px] font-medium">{r.label}</span>
          </ChoiceCard>
        ))}
      </div>
      {draft.refund === "full_refund_until" && (
        <Field label="Hours before the start" hint="24 is usual. Guests who cancel later than this get nothing back.">
          <input inputMode="numeric" value={draft.refundHours} onChange={(e) => onField("refundHours", numeric(e.target.value))} className={inputClass} />
        </Field>
      )}
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
        eyebrow="Step 6 of 11"
        title="What's included"
        intro="Four short lists, one item per line. Plain beats clever."
      />
      {list("inc", "Included in the price", "Included line", "Ten edited photos within five days", 100)}
      {list("exc", "Not included", "Not included line", "Transport to the meeting point", 100)}
      {list("bring", "What to bring", "Bring line", "Shoes you can walk in", 80)}
      {list("wear", "What to wear", "Wear line", "Something you do not mind sweating in", 80)}
    </div>
  );
}
