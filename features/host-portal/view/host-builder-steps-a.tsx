import { Check, Lightbulb, MapPin, Search, Upload } from "lucide-react";
import { useId } from "react";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { ChoiceCard, Field, inputClass, Pill, StepHeading } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

export function StepBasics({ vm }: Props) {
  const { draft, derived, helper, onField } = vm;
  return (
    <div>
      <StepHeading
        eyebrow="Section 1 of 8"
        title="The basics"
        intro="Three things: what it is called, the one line people read first, and the full story. Write the last one like you are telling a friend what the afternoon feels like."
      />
      <Field label="Title" aside={`${derived.titleCount}/60`} hint="Say the place and the thing. People search for both.">
        <input value={draft.title} maxLength={60} placeholder="Lagos Island Photowalk" onChange={(e) => onField("title", e.target.value)} className={inputClass} />
      </Field>
      <Field label="The one line" hint="This sits under your title in search. One sentence, no full stop needed.">
        <input value={draft.hook} onChange={(e) => onField("hook", e.target.value)} className={inputClass} />
      </Field>
      <Field label="The full description" aside={`${derived.descWords} words`} className="mb-3.5">
        <textarea
          value={draft.desc}
          rows={7}
          onChange={(e) => onField("desc", e.target.value)}
          className="w-full resize-y rounded-xl bg-white px-3.5 py-3 text-[15px] leading-relaxed shadow-[inset_0_0_0_1px_#E7E7E7] outline-none focus-visible:shadow-[inset_0_0_0_2px_#333134]"
        />
      </Field>
      <div className="overflow-hidden rounded-[14px] bg-[#FAF9F7] shadow-[inset_0_0_0_1px_#E9E1D2]">
        <button type="button" onClick={helper.onToggle} aria-expanded={helper.open} className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3.5 text-left">
          <Lightbulb className="size-[18px] shrink-0 text-[#333134]" />
          <span className="flex-1 text-[13px] font-medium">Most hosts describe the activity. The ones who sell out describe the feeling.</span>
          <span className="text-xs font-medium text-[#F5032D]">{helper.open ? "Hide" : "Show me"}</span>
        </button>
        {helper.open && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            <div className="rounded-xl bg-white px-3.5 py-3 shadow-[inset_0_0_0_1px_#E7E7E7]">
              <div className="mb-1.5 text-[11px] font-medium tracking-[0.06em] text-[#6F6B72] uppercase">Flat</div>
              <p className="text-sm leading-relaxed text-[#6F6B72]">A 3 hour photography walk around Lagos Island. We visit 6 locations. Photos are included. Suitable for all levels.</p>
            </div>
            <div className="rounded-xl bg-white px-3.5 py-3 shadow-[inset_0_0_0_1px_#E7E7E7]">
              <div className="mb-1.5 text-[11px] font-medium tracking-[0.06em] text-[#0CBA65] uppercase">Alive</div>
              <p className="text-sm leading-relaxed">You do not need a camera and you do not need to know how to pose. I will tell you where to stand. By the third street you will have stopped checking the screen.</p>
            </div>
            <p className="text-xs leading-relaxed text-[#6F6B72]">Three questions worth answering somewhere in your description: what will someone feel, what will they leave with, and who is this not for.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function StepCategory({ vm }: Props) {
  const { draft, options, onPickCategory, onField, onToggle } = vm;
  return (
    <div>
      <StepHeading
        eyebrow="Section 2 of 8"
        title="Category and tags"
        intro="One category. It decides where you appear when someone is browsing. Tags are how you get found by people who already know what they want."
      />
      <div className="mb-2.5 text-[13px] font-medium">Category</div>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {options.categories.map((c) => (
          <ChoiceCard key={c} selected={draft.cat === c} onClick={() => onPickCategory(c)}>
            <span className="font-medium">{c}</span>
          </ChoiceCard>
        ))}
      </div>
      <div className="mb-6">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-[13px] font-medium">Subcategory</span>
          <span className="ml-auto text-xs text-[#6F6B72]">Pick one</span>
        </div>
        {draft.cat && <div className="mb-2.5 text-xs text-[#6F6B72]">The ones we list under {draft.cat}.</div>}
        {options.subcategories.length ? (
          <div className="grid grid-cols-2 gap-2">
            {options.subcategories.map((s) => (
              <ChoiceCard key={s} radio selected={draft.sub === s} onClick={() => onField("sub", s)}>
                {s}
              </ChoiceCard>
            ))}
          </div>
        ) : (
          <div className="mt-2.5 rounded-xl bg-[#FAF9F7] p-4 text-[13px] text-[#6F6B72] shadow-[inset_0_0_0_1px_#E7E7E7]">
            Pick a category first and the subcategories appear here.
          </div>
        )}
      </div>
      <div className="mb-2.5 flex items-baseline gap-2">
        <span className="text-[13px] font-medium">Tags</span>
        <span className="ml-auto text-xs text-[#6F6B72]">{draft.tags.length} picked · three or more</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.tags.map((t) => (
          <Pill key={t} on={draft.tags.includes(t)} onClick={() => onToggle("tags", t)}>
            {t}
          </Pill>
        ))}
      </div>
    </div>
  );
}

export function StepWhere({ vm }: Props) {
  const { draft, place, onField, onMeetPhoto } = vm;
  const fileId = useId();
  return (
    <div>
      <StepHeading
        eyebrow="Section 3 of 8"
        title="Where you meet"
        intro="A landmark, not an address. Guests will be standing on a road they do not know, on a phone, ten minutes late. Give them something they can see."
      />
      <div className="mb-6 flex gap-2.5 rounded-[14px] bg-[#FAF9F7] p-3.5 shadow-[inset_0_0_0_1px_#E9E1D2]">
        <MapPin className="mt-px size-[18px] shrink-0 text-[#333134]" />
        <p className="text-[13px] leading-relaxed text-[#6F6B72]">
          <span className="font-medium text-[#333134]">Why we ask for a landmark.</span> Street numbers on the island are unreliable and map pins land in the wrong place often enough that we do not trust them alone. Every experience that gets a &ldquo;we could not find you&rdquo; review had an address instead of a landmark.
        </p>
      </div>
      <div className="mb-[22px] flex gap-3">
        <Field label="City" className="mb-0 flex-1">
          <input value={draft.city} onChange={(e) => onField("city", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Area" className="mb-0 flex-1">
          <input value={draft.area} onChange={(e) => onField("area", e.target.value)} className={inputClass} />
        </Field>
      </div>
      <div className="mb-[22px]">
        <div className="mb-1.5 text-[13px] font-medium">The landmark</div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-[15px] left-3.5 size-[18px] text-[#6F6B72]" />
          <input
            aria-label="The landmark"
            value={place.query}
            placeholder="Search for a landmark, park, or building"
            onChange={(e) => place.onQuery(e.target.value)}
            onFocus={place.onOpen}
            className={`${inputClass} pl-[42px]`}
          />
          {place.open && (
            <div className="absolute inset-x-0 top-[54px] z-30 flex flex-col rounded-[14px] bg-white p-1.5 shadow-[inset_0_0_0_1px_#E7E7E7,0_12px_32px_rgba(16,24,40,0.14)]">
              {place.results.map((r) => (
                <button key={r.name} type="button" onClick={() => place.onPick(r.name)} className="flex w-full cursor-pointer items-start gap-2.5 rounded-[10px] p-2.5 text-left hover:bg-[#F5F5F5]">
                  <MapPin className="mt-px size-[18px] shrink-0 text-[#6F6B72]" />
                  <span>
                    <span className="block text-[13.5px] font-medium">{r.name}</span>
                    <span className="mt-px block text-xs text-[#6F6B72]">{r.area}</span>
                  </span>
                </button>
              ))}
              {place.noMatch && (
                <div>
                  <p className="p-2.5 text-[13px] leading-normal text-[#6F6B72]">Nothing by that name. Type it out yourself and we will add it.</p>
                  <button type="button" onClick={place.onUseTyped} className="h-9 w-full cursor-pointer rounded-[9px] bg-[#F4F2EE] px-2.5 text-left text-[12.5px] font-medium">
                    Use &ldquo;{place.query}&rdquo; anyway
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {draft.landmark ? (
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#F0FCF5] px-3 py-2.5 shadow-[inset_0_0_0_1px_#C8EED7]">
            <Check className="size-4 shrink-0 text-[#0CBA65]" />
            <span className="text-[12.5px]">Guests will be sent to {draft.landmark}</span>
            <button type="button" onClick={place.onClear} className="ml-auto cursor-pointer text-xs font-medium text-[#F5032D]">Change</button>
          </div>
        ) : (
          <div className="mt-1.5 text-xs text-[#6F6B72]">A place a driver would know without being told twice.</div>
        )}
      </div>
      <Field label="The one line a guest reads while standing there" hint={'Name a colour, a sign, or a gate. "The yellow gate beside Freedom Park" beats "Freedom Park main entrance".'} className="mb-6">
        <input value={draft.cue} onChange={(e) => onField("cue", e.target.value)} className={inputClass} />
      </Field>
      <div className="mb-1.5 text-[13px] font-medium">Photo of the meeting point</div>
      <div className="mb-2.5 text-xs text-[#6F6B72]">Required. Stand where the guest will stand and take one picture.</div>
      <div className="flex items-stretch gap-3">
        {draft.meetPhoto && (
          // eslint-disable-next-line @next/next/no-img-element -- a local preview of a file the host just picked
          <img src={draft.meetPhoto} alt="Meeting point" className="h-[110px] w-[150px] shrink-0 rounded-[14px] object-cover" />
        )}
        <label htmlFor={fileId} className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] bg-[#FCFCFC] p-3.5 text-center shadow-[inset_0_0_0_1px_#E0DFDD] hover:bg-[#FAF9F7]">
          <Upload className="size-5 text-[#6F6B72]" />
          <span className="text-[13px] font-medium">{draft.meetPhoto ? "Choose a different photo" : "Choose a photo"}</span>
          <span className="text-[11.5px] text-[#6F6B72]">JPG or PNG, up to 10 MB</span>
          <input id={fileId} type="file" accept="image/*" className="sr-only" onChange={(e) => onMeetPhoto(e.target.files?.[0])} />
        </label>
      </div>
    </div>
  );
}
