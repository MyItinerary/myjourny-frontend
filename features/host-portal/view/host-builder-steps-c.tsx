import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { Field, inputClass, Pill, StepHeading } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

export function StepRequirements({ vm }: Props) {
  const { draft, derived, options, onField, onToggle } = vm;
  return (
    <div>
      <StepHeading
        eyebrow="Section 7 of 8"
        title="Requirements and safety"
        intro="Say who this is not for. It reads harsh and it saves you the guest who turns up in slippers."
      />
      <div className="mb-2.5 text-[13px] font-medium">How physical it is</div>
      <div className="mb-[22px] flex flex-wrap gap-2">
        {options.fitnessLevels.map((f) => (
          <Pill key={f.key} on={draft.fitness === f.key} onClick={() => onField("fitness", f.key)}>
            {f.label}
          </Pill>
        ))}
      </div>
      <div className="mb-2.5 text-[13px] font-medium">Who can come</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {options.agePolicies.map((a) => (
          <Pill key={a.key} on={draft.agePolicy === a.key} onClick={() => onField("agePolicy", a.key)}>
            {a.label}
          </Pill>
        ))}
      </div>
      {derived.needsAge ? (
        <Field label={draft.agePolicy === "minimum_age" ? "Youngest age allowed" : "Age below which an adult must come"}>
          <input inputMode="numeric" value={draft.ageMin} onChange={(e) => onField("ageMin", e.target.value.replace(/\D/g, ""))} className={inputClass} />
        </Field>
      ) : (
        <div className="mb-[22px]" />
      )}
      <Field label="Do guests need to swim" hint="Only shown to guests on water and beach experiences.">
        <input value={draft.swim} maxLength={100} onChange={(e) => onField("swim", e.target.value)} className={inputClass} />
      </Field>
      <div className="mb-1 text-[13px] font-medium">Food you can work around</div>
      <div className="mb-2.5 text-xs text-[#6F6B72]">Pick nothing if food is not part of your experience.</div>
      <div className="mb-[22px] flex flex-wrap gap-2">
        {options.diets.map((d) => (
          <Pill key={d} on={draft.diet.includes(d)} onClick={() => onToggle("diet", d)}>
            {d}
          </Pill>
        ))}
      </div>
      <div className="mb-2.5 text-[13px] font-medium">Wheelchairs and getting around</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {options.accessOptions.map((a) => (
          <Pill key={a.key} on={draft.access === a.key} onClick={() => onField("access", a.key)}>
            {a.label}
          </Pill>
        ))}
      </div>
      <Field label="Anything else about getting around, optional" hint="Stairs, sand, uneven ground, how far the walk is. Say it plainly.">
        <input value={draft.accessNote} maxLength={100} onChange={(e) => onField("accessNote", e.target.value)} className={inputClass} />
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
        <span className="text-[#6F6B72]">{vm.uploading > 0 ? `Uploading ${vm.uploading}…` : derived.photoHint}</span>
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

export function StepReviews({ vm }: Props) {
  const { reviews } = vm;
  return (
    <div>
      <StepHeading
        eyebrow="Step 9 of 11"
        title="Reviews"
        intro="New experiences start with none. Bring in the reviews you already have so guests have something to go on."
      />
      <div className="mb-1 text-[13px] font-medium">Bring in reviews you already have</div>
      <p className="mb-3.5 text-[12.5px] leading-normal text-pretty text-[#6F6B72]">
        Reviews stay exactly as written and are labelled with where they came from. You cannot edit them, and you can hide any you do not want shown.
      </p>
      <div className="mb-3.5 grid grid-cols-2 gap-2.5">
        {reviews.platforms.map((platform) => (
          <button
            key={platform}
            type="button"
            aria-pressed={reviews.selected === platform}
            onClick={() => reviews.onSelect(platform)}
            className={cn(
              "flex cursor-pointer flex-col gap-[3px] rounded-[14px] bg-white px-3.5 py-[13px] text-left hover:shadow-[inset_0_0_0_2px_#FF4540]",
              reviews.selected === platform ? "shadow-[inset_0_0_0_2px_#F5032D]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
            )}
          >
            <span className="text-sm font-medium">{platform}</span>
            <span className="text-xs text-[#6F6B72]">Not connected</span>
          </button>
        ))}
      </div>
      {reviews.selected && (
        <div className="mb-[18px] flex gap-2.5">
          <input
            aria-label={`${reviews.selected} link`}
            value={reviews.url}
            placeholder={reviews.urlPlaceholder}
            onChange={(e) => reviews.onUrl(e.target.value)}
            className={cn(inputClass, "min-w-0 flex-1 text-[14.5px]")}
          />
          <button
            type="button"
            disabled={!reviews.canImport}
            onClick={reviews.onImport}
            className="h-12 shrink-0 cursor-pointer rounded-full bg-[#F5032D] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#BDBDBD]"
          >
            Import reviews
          </button>
        </div>
      )}
      <div className="rounded-[14px] bg-[#FAF9F7] p-[18px] text-[13.5px] leading-[1.6] text-pretty shadow-[inset_0_0_0_1px_#E9E1D2]">
        No reviews yet. That is fine for a new experience. Pick a place above to bring in the ones you already have.
      </div>
    </div>
  );
}

export function StepBooking({ vm }: Props) {
  const { booking } = vm;
  const group = (label: string, options: { key: string; label: string; sub: string; selected: boolean }[], onPick: (key: string) => void, saveable?: (key: string) => boolean) => (
    <section aria-label={label} className="mb-[22px]">
      <div className="mb-2.5 text-[13px] font-medium">{label}</div>
      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={o.selected}
            disabled={saveable ? !saveable(o.key) : false}
            onClick={() => onPick(o.key)}
            className={cn(
              "flex w-full cursor-pointer items-start gap-2.5 rounded-xl bg-white px-3.5 py-3 text-left text-[13.5px] hover:shadow-[inset_0_0_0_2px_#FF4540] disabled:cursor-not-allowed disabled:bg-[#FAF9F7] disabled:hover:shadow-[inset_0_0_0_1px_#E7E7E7]",
              o.selected ? "shadow-[inset_0_0_0_2px_#F5032D]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
            )}
          >
            <span aria-hidden className={cn("mt-px size-[17px] shrink-0 rounded-full", o.selected ? "shadow-[inset_0_0_0_5px_#F5032D]" : "shadow-[inset_0_0_0_1.5px_#D2D2D2]")} />
            <span>
              <span className="block font-medium">{o.label}</span>
              <span className="mt-0.5 block text-xs leading-normal text-[#6F6B72]">{o.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
  return (
    <div>
      <StepHeading eyebrow="Step 10 of 11" title="How guests book" intro="How people book, and what happens if they cancel." />
      {group("Booking type", booking.types, (key) => booking.onType(key as "instant" | "request"))}
      {group("Cancellation terms", booking.tiers, booking.onTier, (key) => booking.tiers.find((t) => t.key === key)?.saveable ?? false)}
      {booking.promise && (
        <p className="mb-4 rounded-xl bg-[#FAF9F7] px-3.5 py-3 text-[13px] leading-normal shadow-[inset_0_0_0_1px_#E9E1D2]">
          <span className="font-medium">Guests will read:</span> {booking.promise}
        </p>
      )}
      <p className="text-xs leading-normal text-[#6F6B72]">{booking.unsaved}</p>
    </div>
  );
}

export function StepReview({ vm }: Props) {
  const { draft, derived, canPublish, onField, onStep, onPublish } = vm;
  return (
    <div>
      <StepHeading eyebrow="Last look" title="Review and publish" intro="Anything still missing is listed below, and each line takes you to the step." />
      <div className="mb-6 rounded-2xl bg-[#FAF9F7] p-[18px] shadow-[inset_0_0_0_1px_#E9E1D2]">
        <div className="mb-3.5 text-[13px] font-medium">Everything we need</div>
        <ul className="flex flex-col gap-[11px]">
          {derived.checklist.map((c) => (
            <li key={c.step} className="flex items-center gap-2.5">
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
      <Field label="One line from you, in your own words" hint="Optional. Guests see it next to your name on the experience. Say the thing you would say to them at the gate.">
        <input value={draft.quote} maxLength={140} onChange={(e) => onField("quote", e.target.value)} className={inputClass} />
      </Field>
      {vm.publishBlock && <p className="mb-3 rounded-xl bg-[#FDF7EB] px-3.5 py-2.5 text-[13px] text-[#8A5A07]">{vm.publishBlock}</p>}
      <button
        type="button"
        disabled={!canPublish}
        onClick={onPublish}
        className="h-12 cursor-pointer rounded-full bg-[#F5032D] px-[22px] text-[15px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#BDBDBD]"
      >
        {vm.publishing ? "Publishing…" : vm.editing ? "Save and publish" : "Publish this experience"}
      </button>
      <p className="mt-2.5 text-xs text-[#6F6B72]">
        It goes live straight away. We look over new experiences and will email you if anything needs to change.
      </p>
    </div>
  );
}
