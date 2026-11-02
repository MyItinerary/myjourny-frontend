import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { Field, inputClass, LineList, Pill, StepHeading } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

const numeric = (value: string) => value.replace(/[^\d]/g, "");

export function StepWhen({ vm }: Props) {
  const { draft, options, derived, onField, onToggle, onListSet, onListAdd, onListDel } = vm;
  return (
    <div>
      <StepHeading
        eyebrow="Section 4 of 8"
        title="When it runs"
        intro="Pick the shape of your schedule. You can block single dates later from your calendar without touching this."
      />
      <div className="mb-6 flex gap-2.5">
        {options.whenTypes.map((w) => (
          <button
            key={w.key}
            type="button"
            aria-pressed={draft.whenType === w.key}
            onClick={() => onField("whenType", w.key)}
            className={cn(
              "flex-1 cursor-pointer rounded-xl bg-white p-3.5 text-left",
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
          <div className="mb-5 flex flex-wrap gap-1.5">
            {options.weekDays.map((d) => (
              <Pill key={d} on={draft.days.includes(d)} onClick={() => onToggle("days", d)} className="h-[38px] w-11 rounded-xl px-0">
                {d}
              </Pill>
            ))}
          </div>
          <div className="mb-2.5 text-[13px] font-medium">How often</div>
          <div className="mb-5 flex flex-wrap gap-2">
            {options.everyOptions.map((e) => (
              <Pill key={e.value} on={draft.every === e.value} onClick={() => onField("every", e.value)}>
                {e.label}
              </Pill>
            ))}
          </div>
          <div className="mb-5 flex gap-3">
            <Field label="How long it lasts" className="mb-0 flex-1">
              <div className="relative">
                <input inputMode="numeric" value={draft.dur} onChange={(e) => onField("dur", numeric(e.target.value))} className={`${inputClass} pr-16`} />
                <span className="pointer-events-none absolute top-3.5 right-3.5 text-sm text-[#6F6B72]">hours</span>
              </div>
            </Field>
            <Field label="Repeat until" className="mb-0 flex-1">
              <input value={draft.until} placeholder="e.g. 31 Dec 2026" onChange={(e) => onField("until", e.target.value)} className={inputClass} />
            </Field>
          </div>
          <div className="mb-2.5 text-[13px] font-medium">Start times</div>
          <div className="flex flex-col gap-2">
            {draft.slots.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <input aria-label={`Start time ${i + 1}`} value={t} placeholder="16:00" onChange={(e) => onListSet("slots", i, e.target.value)} className={cn(inputClass, "h-11 w-[120px]")} />
                <button type="button" aria-label={`Remove start time ${i + 1}`} onClick={() => onListDel("slots", i)} className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#6F6B72] hover:bg-[#F4F2EE]">
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onListAdd("slots")} className="mt-2.5 flex cursor-pointer items-center gap-1 text-[13px] font-medium text-[#F5032D]">
            <Plus className="size-3.5" />
            Add another start time
          </button>
          <div className="mt-6 rounded-[14px] bg-[#FAF9F7] p-4 shadow-[inset_0_0_0_1px_#E9E1D2]">
            <div className="text-[13px] font-medium">This is what you just made</div>
            <div className="mt-0.5 mb-3 text-xs text-[#6F6B72]">{derived.slotSummary} · next five dates</div>
            <ul className="flex flex-col gap-1.5">
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
            <input value={draft.until} placeholder="e.g. Sat 3 Oct 2026" onChange={(e) => onField("until", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Start time" className="mb-0 flex-1">
            <input
              value={draft.slots[0] ?? ""}
              placeholder="16:00"
              onChange={(e) => onField("slots", [e.target.value])}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {draft.whenType === "request" && (
        <div className="rounded-[14px] bg-[#FAF9F7] p-4 text-[13px] leading-relaxed text-[#6F6B72] shadow-[inset_0_0_0_1px_#E9E1D2]">
          Guests will ask for a date and you reply with what works. Fewer bookings come in this way, but you keep every weekend free until you say yes. You still need to answer within 24 hours.
        </div>
      )}
    </div>
  );
}

export function StepPrice({ vm }: Props) {
  const { draft, derived, onField } = vm;
  const money = (key: "price" | "priv", label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <div className="relative">
        <span className="pointer-events-none absolute top-3 left-3.5 text-[15px] text-[#6F6B72]">₦</span>
        <input inputMode="numeric" value={draft[key]} onChange={(e) => onField(key, numeric(e.target.value))} className={`${inputClass} pl-8`} />
      </div>
    </Field>
  );
  return (
    <div>
      <StepHeading
        eyebrow="Section 5 of 8"
        title="Group size and price"
        intro="You are pricing a seat, not your day. Work out what you would charge one person for the whole thing, then divide it across the group and add a little back."
      />
      <div className="flex gap-3">
        <Field label="Smallest group you will run" hint="Below this we tell guests and refund them." className="flex-1">
          <input inputMode="numeric" value={draft.minG} onChange={(e) => onField("minG", numeric(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Most you can handle" hint="Be honest. A crowded walk gets three stars." className="flex-1">
          <input inputMode="numeric" value={draft.maxG} onChange={(e) => onField("maxG", numeric(e.target.value))} className={inputClass} />
        </Field>
      </div>
      {money("price", "Price per person")}
      {money("priv", "Price for one private group, optional", "One family or one office books the whole slot and nobody else joins.")}
      <div className="rounded-[14px] bg-[#FAF9F7] p-4 shadow-[inset_0_0_0_1px_#E9E1D2]">
        <div className="text-[11px] font-medium tracking-[0.06em] text-[#6F6B72] uppercase">A full group</div>
        <div className="mt-1 mb-3 text-sm font-medium">{derived.price.line}</div>
        <dl className="flex flex-col gap-1.5 border-t border-[#E9E1D2] pt-3 text-[13px]">
          <div className="flex justify-between"><dt className="text-[#6F6B72]">Guests pay</dt><dd>{derived.price.gross}</dd></div>
          <div className="flex justify-between"><dt className="text-[#6F6B72]">Our commission, {derived.commissionPercent} percent</dt><dd>- {derived.price.commission}</dd></div>
          <div className="flex justify-between font-medium"><dt>You keep</dt><dd>{derived.price.net}</dd></div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-[#6F6B72]">
          That is {derived.price.perSeat} per seat, in your bank within 24 hours of the walk finishing. No listing fee, nothing else taken.
        </p>
      </div>
    </div>
  );
}

export function StepIncluded({ vm }: Props) {
  const { draft, onListSet, onListAdd, onListDel } = vm;
  const list = (key: "inc" | "exc" | "bring" | "wear", title: string, label: string) => (
    <LineList
      title={title}
      label={label}
      lines={draft[key]}
      onSet={(i, v) => onListSet(key, i, v)}
      onAdd={() => onListAdd(key)}
      onDel={(i) => onListDel(key, i)}
    />
  );
  return (
    <div>
      <StepHeading
        eyebrow="Section 6 of 8"
        title="What's included"
        intro="Four short lists. This is where most arguments get avoided, so be plain about what people are paying for and what they are not."
      />
      {list("inc", "Included in the price", "Included line")}
      {list("exc", "Not included", "Not included line")}
      {list("bring", "What to bring", "Bring line")}
      {list("wear", "What to wear", "Wear line")}
    </div>
  );
}
