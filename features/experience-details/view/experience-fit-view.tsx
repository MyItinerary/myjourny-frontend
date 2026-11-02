import type { ComponentType, SVGProps } from "react";
import { Accessibility, Bus, CloudSun, HeartPulse, Languages, Users } from "lucide-react";

import type { FitItem, FitKind } from "../model/experience-details.types";

const ICONS: Record<FitKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  fitness: HeartPulse,
  age: Users,
  accessibility: Accessibility,
  languages: Languages,
  weather: CloudSun,
  pickup: Bus,
};

/** Fitness, age, accessibility, languages, weather and pickup; nothing when none are set. */
export function ExperienceFitView({ items }: { items: FitItem[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Fit and logistics</h2>
      <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2">
        {items.map((item) => {
          const Icon = ICONS[item.kind];
          return (
            <li key={item.kind} className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="size-[18px]" aria-hidden />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-medium text-foreground">{item.label}</span>
                <span className="text-sm text-foreground">{item.value}</span>
                {item.note && <span className="text-sm text-muted-foreground">{item.note}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
