import type { ItineraryStep } from "../model/experience-details.types";

/** The experience's steps in order; nothing when it has none. */
export function ExperienceItineraryView({ steps }: { steps: ItineraryStep[] }) {
  if (!steps.length) return null;
  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Itinerary</h2>
      <ol className="mt-4 flex flex-col gap-5">
        {steps.map((step, index) => (
          // Steps have no identity beyond their position.
          <li key={index} className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
              {index + 1}
            </span>
            <div className="flex flex-col gap-0.5 pt-0.5">
              <span className="text-base font-medium text-foreground">{step.title}</span>
              {step.description && <span className="text-sm text-muted-foreground">{step.description}</span>}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs text-muted-foreground">ⓘ Please note that the itinerary is subject to change.</p>
    </section>
  );
}
