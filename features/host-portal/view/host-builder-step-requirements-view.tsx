import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { ChoiceCard, Field, inputClass, Pill, StepHeading } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

const LABEL = "mb-2.5 text-base font-medium text-[#333134]";

export function StepRequirements({ vm }: Props) {
  const { draft, derived, options, onField, onToggle } = vm;
  return (
    <div>
      <StepHeading
        title="Requirements and safety"
        intro="Tell guests what this experience asks of them, so the right people book and nobody is caught out on the day."
      />
      <div className={LABEL}>Fitness level</div>
      <div className="mb-[22px] flex flex-wrap gap-2">
        {options.fitnessLevels.map((f) => (
          <Pill key={f.key} on={draft.fitness === f.key} onClick={() => onField("fitness", f.key)}>
            {f.label}
          </Pill>
        ))}
      </div>
      <div className={LABEL}>Who can come</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {options.agePolicies.map((a) => (
          <Pill key={a.key} on={draft.agePolicy === a.key} onClick={() => onField("agePolicy", a.key)}>
            {a.label}
          </Pill>
        ))}
      </div>
      {derived.needsAge ? (
        <Field label={draft.agePolicy === "minimum_age" ? "Youngest age allowed" : "Guests under this age must come with an adult"}>
          <input inputMode="numeric" value={draft.ageMin} onChange={(e) => onField("ageMin", e.target.value.replace(/\D/g, ""))} className={inputClass} />
        </Field>
      ) : (
        <div className="mb-[22px]" />
      )}
      <div className="mb-[22px]">
        <div className="mb-1 text-base font-medium text-[#333134]">Do guests need to know how to swim?</div>
        <div className="mb-2.5 text-xs text-[#6F6B72]">Guests only see this on water and beach experiences.</div>
        <div role="radiogroup" aria-label="Do guests need to know how to swim?" className="grid grid-cols-2 gap-2">
          {options.swimChoices.map((c) => (
            <ChoiceCard key={c.label} radio selected={draft.swim === c.value} onClick={() => onField("swim", c.value)}>
              <span className="font-medium">{c.label}</span>
            </ChoiceCard>
          ))}
        </div>
      </div>
      <div className={LABEL}>Dietary needs you can cater for</div>
      <div className="mb-[22px] flex flex-wrap gap-2">
        {options.diets.map((d) => (
          <Pill key={d} on={draft.diet.includes(d)} onClick={() => onToggle("diet", d)}>
            {d}
          </Pill>
        ))}
      </div>
      <div className={LABEL}>Accessibility</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {options.accessOptions.map((a) => (
          <Pill key={a.key} on={draft.access === a.key} onClick={() => onField("access", a.key)}>
            {a.label}
          </Pill>
        ))}
      </div>
      <Field label="Anything else guests should know about access (optional)" hint="For example: stairs, sand, uneven ground or a long walk.">
        <input value={draft.accessNote} maxLength={100} onChange={(e) => onField("accessNote", e.target.value)} className={inputClass} />
      </Field>
      <div className="mb-6 rounded-[14px] bg-white p-4 shadow-[inset_0_0_0_1px_#E7E7E7]">
        <div className="flex items-center gap-3.5">
          <div className="flex-1">
            <div className="text-[13.5px] font-medium">Bad weather could cancel this experience</div>
            <div className="mt-0.5 text-xs text-[#6F6B72]">Turn this on and guests see what happens in bad weather before they pay.</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.weather}
            aria-label="Bad weather could cancel this experience"
            onClick={() => onField("weather", !draft.weather)}
            className={cn("relative h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full transition-colors", draft.weather ? "bg-[#F5032D]" : "bg-[#E0E0E0]")}
          >
            <span className={cn("absolute top-[3px] size-5 rounded-full bg-white transition-[left]", draft.weather ? "left-[23px]" : "left-[3px]")} />
          </button>
        </div>
        {draft.weather && (
          <p className="mt-3 rounded-xl bg-[#FAF9F7] p-3 text-[12.5px] leading-relaxed text-[#6F6B72]">
            <span className="font-medium text-[#333134]">What guests see:</span> If bad weather stops the experience, you can move to
            another date for free or get a full refund. The host decides by 10am on the day, and we let everyone know.
          </p>
        )}
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#FAF9F7] p-4 shadow-[inset_0_0_0_1px_#E9E1D2]">
        <input
          type="checkbox"
          checked={draft.safetyAgreed}
          onChange={(e) => onField("safetyAgreed", e.target.checked)}
          className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-[#F5032D]"
        />
        <span className="text-[13px] leading-relaxed text-[#333134]">
          I&apos;ve read the{" "}
          <Link href="/legal/safety" target="_blank" className="font-medium text-[#F5032D] underline underline-offset-2">
            host safety rules
          </Link>{" "}
          and everything above is true. I&apos;ll{" "}
          <a href="mailto:support@myjourny.app" className="font-medium text-[#F5032D] underline underline-offset-2">
            tell MyJourny
          </a>{" "}
          within 24 hours if a guest is hurt during my experience.
        </span>
      </label>
    </div>
  );
}
