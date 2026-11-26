import { MapPin, Upload, X } from "lucide-react";
import { useId } from "react";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { LocationPicker } from "./host-builder-location-view";
import { ChoiceCard, Field, inputClass, Pill, StepHeading } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

const textareaClass =
  "w-full resize-y rounded-xl bg-white px-3.5 py-3 text-[15px] leading-relaxed shadow-[inset_0_0_0_1px_#E7E7E7] outline-none placeholder:text-[#A09DA3] focus-visible:shadow-[inset_0_0_0_2px_#333134]";

export function StepBasics({ vm }: Props) {
  const { draft, derived, onField, onFocusField } = vm;
  return (
    <div>
      <StepHeading badge="Required" title="Title and description" />
      <Field
        label="Title"
        sub="Add the place and the activity. It helps people find your experience faster."
        count={`${derived.titleCount}/60`}
      >
        <input
          value={draft.title}
          maxLength={60}
          placeholder="Lagos Island Photowalk"
          onChange={(e) => onField("title", e.target.value)}
          onFocus={() => onFocusField("title")}
          className={inputClass}
        />
      </Field>
      <Field
        label="Short description"
        sub="Two or three sentences that give guests a taste of what they'll do. It's the first thing they read after the title, so make them want to read on."
        count={derived.hookCount}
      >
        <textarea
          value={draft.hook}
          rows={3}
          placeholder="Three hours, six streets, and photos of you that you will actually use."
          onChange={(e) => onField("hook", e.target.value)}
          onFocus={() => onFocusField("hook")}
          className={textareaClass}
        />
      </Field>
      <Field
        label="Long description"
        sub="Take guests through it from start to finish: what happens, how it feels, and what they leave with."
        count={derived.descCount}
        error={derived.descError}
        className="mb-0"
      >
        <textarea
          value={draft.desc}
          rows={10}
          placeholder="Tell people what the afternoon feels like, who it is for and what they will walk away with."
          onChange={(e) => onField("desc", e.target.value)}
          onFocus={() => onFocusField("desc")}
          className={textareaClass}
        />
      </Field>
    </div>
  );
}

const SECTION_LABEL = "mb-2.5 text-base font-medium text-[#333134]";
/** Matches the label on `Field`, for inputs laid out by hand. */
const FIELD_LABEL = "mb-1.5 text-base font-medium text-[#333134]";

export function StepCategory({ vm }: Props) {
  const { draft, options, onPickCategory, onToggle } = vm;
  return (
    <div>
      <StepHeading
        badge="Required"
        title="Category and tags"
        intro="Pick every category that fits your experience. That's where people find you when they browse. Tags help people who are looking for something specific."
      />
      <div className={SECTION_LABEL}>Category</div>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {options.categories.map((c) => (
          <ChoiceCard key={c} selected={draft.cats.includes(c)} onClick={() => onPickCategory(c)}>
            <span className="font-medium">{c}</span>
          </ChoiceCard>
        ))}
      </div>
      <div className="mb-6">
        <div className={SECTION_LABEL}>Subcategory</div>
        {options.subGroups.length ? (
          <div className="flex flex-col gap-4">
            {options.subGroups.map((group) => (
              <div key={group.category}>
                {options.subGroups.length > 1 && <div className="mb-2 text-xs text-[#6F6B72]">{group.category}</div>}
                <div className="grid grid-cols-2 gap-2">
                  {group.subs.map((s) => (
                    <ChoiceCard key={s} selected={draft.subs.includes(s)} onClick={() => onToggle("subs", s)}>
                      {s}
                    </ChoiceCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-[#FAF9F7] p-4 text-[13px] text-[#6F6B72] shadow-[inset_0_0_0_1px_#E7E7E7]">
            Pick a category first and the subcategories appear here.
          </div>
        )}
      </div>
      <div className={SECTION_LABEL}>Tags</div>
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
      <StepHeading badge="Required" title="Location" />
      <div className="mb-6 flex gap-2.5 rounded-[14px] bg-[#FAF9F7] p-3.5 shadow-[inset_0_0_0_1px_#E9E1D2]">
        <MapPin className="mt-px size-[18px] shrink-0 text-[#333134]" />
        <p className="text-[13px] leading-relaxed text-[#6F6B72]">
          <span className="font-medium text-[#333134]">Why we ask for these details.</span> Map pins can land in the wrong
          place. Your location puts you on the map, the meeting point tells guests where to stand, and the photo helps them spot it.
        </p>
      </div>
      <LocationPicker place={place} />
      <Field label="Specific meeting point" sub={'Give a specific description that helps people find the spot, for example "behind the black 2 storey building".'} className="mb-6">
        <input value={draft.cue} placeholder="Behind the black 2 storey building" onChange={(e) => onField("cue", e.target.value)} className={inputClass} />
      </Field>
      <div className={FIELD_LABEL}>Photo of the meeting point</div>
      <label
        htmlFor={fileId}
        className="flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] bg-[#FCFCFC] p-5 text-center shadow-[inset_0_0_0_1px_#E0DFDD] hover:bg-[#FAF9F7]"
      >
        <Upload className="size-6 text-[#6F6B72]" />
        <span className="text-[13.5px] font-medium">
          {vm.uploading > 0 ? "Uploading…" : draft.meetPhoto ? "Choose a different photo" : "Choose a photo"}
        </span>
        <span className="text-[11.5px] text-[#6F6B72]">JPG or PNG, up to 10 MB</span>
        <input
          id={fileId}
          type="file"
          accept="image/*"
          aria-label="Photo of the meeting point"
          className="sr-only"
          onChange={(e) => {
            onMeetPhoto(e.target.files?.[0]);
            // Cleared, so picking the same photo again (say, after deleting it) still uploads.
            e.target.value = "";
          }}
        />
      </label>
      {draft.meetPhoto && (
        <div className="relative mt-3 h-[72px] w-24 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- the photo the host just uploaded */}
          <img src={draft.meetPhoto} alt="Meeting point" className="size-full object-cover" />
          <button
            type="button"
            aria-label="Delete the meeting point photo"
            onClick={() => onField("meetPhoto", "")}
            className="absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#333134] hover:bg-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
