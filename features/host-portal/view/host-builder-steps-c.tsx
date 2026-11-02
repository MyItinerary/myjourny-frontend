import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { ChoiceCard, Field, inputClass, Pill, StepHeading } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

export function StepRequirements({ vm }: Props) {
  const { draft, options, onField, onToggle } = vm;
  return (
    <div>
      <StepHeading
        eyebrow="Section 7 of 8"
        title="Requirements and safety"
        intro="Say who this is not for. It reads harsh and it saves you the guest who turns up in slippers."
      />
      <div className="flex gap-3">
        <Field label="Youngest age allowed" className="flex-1">
          <input inputMode="numeric" value={draft.ageMin} onChange={(e) => onField("ageMin", e.target.value.replace(/\D/g, ""))} className={inputClass} />
        </Field>
        <Field label="How physical it is" className="flex-1">
          <input value={draft.fitness} placeholder="e.g. Easy, light walking" onChange={(e) => onField("fitness", e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="Do guests need to swim" hint="Only shown to guests on water and beach listings.">
        <input value={draft.swim} onChange={(e) => onField("swim", e.target.value)} className={inputClass} />
      </Field>
      <div className="mb-1 text-[13px] font-medium">Food you can work around</div>
      <div className="mb-2.5 text-xs text-[#6F6B72]">Pick nothing if food is not part of your listing.</div>
      <div className="mb-[22px] flex flex-wrap gap-2">
        {options.diets.map((d) => (
          <Pill key={d} on={draft.diet.includes(d)} onClick={() => onToggle("diet", d)}>
            {d}
          </Pill>
        ))}
      </div>
      <Field label="Getting around" hint="Stairs, sand, uneven ground, how far the walk is. Say it plainly.">
        <input value={draft.access} onChange={(e) => onField("access", e.target.value)} className={inputClass} />
      </Field>
      <div className="mb-6 rounded-[14px] bg-white p-4 shadow-[inset_0_0_0_1px_#E7E7E7]">
        <div className="flex items-center gap-3.5">
          <div className="flex-1">
            <div className="text-[13.5px] font-medium">Weather can stop this happening</div>
            <div className="mt-0.5 text-xs text-[#6F6B72]">Turn this on and guests see your reschedule rule before they pay.</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.weather}
            aria-label="Weather can stop this happening"
            onClick={() => onField("weather", !draft.weather)}
            className={cn("relative h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full transition-colors", draft.weather ? "bg-[#F5032D]" : "bg-[#E0E0E0]")}
          >
            <span className={cn("absolute top-[3px] size-5 rounded-full bg-white transition-[left]", draft.weather ? "left-[23px]" : "left-[3px]")} />
          </button>
        </div>
        {draft.weather && (
          <p className="mt-3 rounded-xl bg-[#FAF9F7] p-3 text-[12.5px] leading-relaxed text-[#6F6B72]">
            <span className="font-medium text-[#333134]">Your rule:</span> if rain stops the walk, guests move to the next Saturday for free or take a full refund, their choice. You decide by 10am on the day and we message everyone for you.
          </p>
        )}
      </div>
      <p className="flex gap-2.5 text-[13px] leading-relaxed text-[#6F6B72]">
        I have read the host safety rules and everything above is true. I will tell MyJourny within 24 hours if a guest is hurt on my experience.
      </p>
    </div>
  );
}

export function StepPhotos({ vm }: Props) {
  const { draft, derived, onAddPhotos, onMovePhoto, onDeletePhoto, onField } = vm;
  const fileId = useId();
  return (
    <div>
      <StepHeading
        eyebrow="Section 8 of 8"
        title="Photos"
        intro="People decide here, before they read a word. Show faces mid activity, not empty views. Your cover photo is the one that does the work."
      />
      <div className="mb-3.5 flex items-baseline gap-2.5 text-[13px]">
        <span className="font-medium">{derived.photoLabel}</span>
        <span className="text-[#6F6B72]">{derived.photoHint}</span>
      </div>
      {draft.photos.length > 1 && <div className="mb-3 text-[12.5px] text-[#6F6B72]">This is the order guests swipe through. The first one is your cover.</div>}
      <div className="grid grid-cols-3 gap-2.5">
        {draft.photos.map((src, i) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-[#F4F2EE]">
            {/* eslint-disable-next-line @next/next/no-img-element -- a local preview of a file the host just picked */}
            <img src={src} alt={`Photo ${i + 1}`} className="size-full object-cover" />
            <span className={cn("absolute top-1.5 left-1.5 min-w-5 rounded-full px-2 py-[3px] text-center text-[10.5px] font-medium", i === draft.cover ? "bg-[#F5032D] text-white" : "bg-white/90 text-[#333134]")}>
              {i === draft.cover ? "Cover" : i + 1}
            </span>
            <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => onDeletePhoto(i)} className="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90">
              <X className="size-3.5" />
            </button>
            <div className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1">
              <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0} onClick={() => onMovePhoto(i, -1)} className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90 disabled:cursor-not-allowed disabled:opacity-40">
                <ArrowLeft className="size-3.5" />
              </button>
              <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === draft.photos.length - 1} onClick={() => onMovePhoto(i, 1)} className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90 disabled:cursor-not-allowed disabled:opacity-40">
                <ArrowRight className="size-3.5" />
              </button>
              {i !== draft.cover && (
                <button type="button" onClick={() => onField("cover", i)} className="ml-auto h-6 cursor-pointer rounded-full bg-white/90 px-2.5 text-[10.5px] font-medium">
                  Make cover
                </button>
              )}
            </div>
          </div>
        ))}
        <label htmlFor={fileId} className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-[14px] bg-[#FCFCFC] text-center shadow-[inset_0_0_0_1px_#E0DFDD] hover:bg-[#FAF9F7]">
          <ImagePlus className="size-5 text-[#6F6B72]" />
          <span className="text-[13px] font-medium">Add photos</span>
          <input id={fileId} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { onAddPhotos(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
        </label>
      </div>
      <p className="mt-3.5 text-xs leading-relaxed text-[#6F6B72]">Landscape, at least 1200 pixels wide, under 10 MB each. Screenshots and photos with a watermark get sent back.</p>
    </div>
  );
}

export function StepReview({ vm }: Props) {
  const { draft, options, derived, canPublish, onField, onStep, onPublish } = vm;
  return (
    <div>
      <StepHeading eyebrow="Last look" title="Review and publish" intro="The panel on the right is exactly what a guest sees. Two things left, then you are done." />
      <Field label="One line from you, in your own words" hint="This is the last thing a guest reads after they pay. Say the thing you would say to them at the gate.">
        <input value={draft.quote} onChange={(e) => onField("quote", e.target.value)} className={inputClass} />
      </Field>
      <div className="mb-2.5 text-[13px] font-medium">How guests book</div>
      <div className="mb-6 flex flex-col gap-2">
        {options.bookTypes.map((b) => (
          <ChoiceCard key={b.key} radio selected={draft.bookType === b.key} onClick={() => onField("bookType", b.key)}>
            <span>
              <span className="mb-[3px] block text-[13.5px] font-medium">{b.label}</span>
              <span className="block text-[12.5px] leading-normal text-[#6F6B72]">{b.sub}</span>
            </span>
          </ChoiceCard>
        ))}
      </div>
      <div className="mb-6 rounded-[14px] bg-white shadow-[inset_0_0_0_1px_#E7E7E7]">
        <div className="px-4 py-3 text-[13px] font-medium shadow-[inset_0_-1px_0_#E7E7E7]">Everything we need</div>
        <ul>
          {derived.checklist.map((c) => (
            <li key={c.step} className="flex items-center gap-2.5 px-4 py-2.5">
              <span aria-hidden className={cn("flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white", c.ok ? "bg-[#0CBA65]" : "bg-[#D9921C]")}>
                {c.ok ? "✓" : "!"}
              </span>
              <span className="text-[13.5px]">{c.label}</span>
              {!c.ok && (
                <button type="button" onClick={() => onStep(c.step)} className="ml-auto cursor-pointer text-xs font-medium text-[#F5032D]">
                  Finish this
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        disabled={!canPublish}
        onClick={onPublish}
        className="h-12 cursor-pointer rounded-full bg-[#F5032D] px-[22px] text-[15px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#BDBDBD]"
      >
        Publish this listing
      </button>
      <p className="mt-2.5 text-xs text-[#6F6B72]">We look at new listings within 48 hours. You will get a WhatsApp either way.</p>
    </div>
  );
}
