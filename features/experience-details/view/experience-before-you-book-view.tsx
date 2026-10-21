import type { ComponentType, SVGProps } from "react";
import { Backpack, Check, Clock, HeartPulse, Users, XCircle, Zap } from "lucide-react";

import type { BeforeYouBookItem, BeforeYouBookKind } from "../model/experience-details.types";

const ICONS: Record<BeforeYouBookKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  guests: Users,
  activity: Zap,
  duration: Clock,
  requirements: HeartPulse,
  included: Check,
  bring: Backpack,
  cancellation: XCircle,
};

/** The experience's own details; nothing when it has none. */
export function ExperienceBeforeYouBookView({ items }: { items: BeforeYouBookItem[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Before you book</h2>
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
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
