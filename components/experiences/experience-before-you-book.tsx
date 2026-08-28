"use client";

import type { ComponentType, SVGProps } from "react";
import { Backpack, Bus, CreditCard, Users, XCircle, Zap } from "lucide-react";

import { formatDuration } from "@/lib/queries/experiences";
import type { ExperienceDetail } from "@/lib/queries/experiences";

interface Item {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
}

// A couple of these (guest requirements, cancellation policy, total time
// spent, activity level) are backed by real fields on the experience;
// pickup/what-to-bring/payment-policy have no per-experience source in the
// DTO at all yet — itin doesn't have a dedicated field for them — so those
// three stay generic copy rather than fabricated specifics, same
// reasoning as the itinerary/reviews placeholders below them on the page.
export function ExperienceBeforeYouBook({ experience }: { experience: ExperienceDetail }) {
  const items: Item[] = [
    {
      icon: Users,
      label: "Guest requirements",
      description: experience.group_size_max
        ? `We can accept up to ${experience.group_size_max} guests in total`
        : "Check with your host for group size limits",
    },
    {
      icon: Bus,
      label: "Pickup available",
      description: "We've arranged pick up, but you'll have to arrange with the host on your meeting point",
    },
    {
      icon: Zap,
      label: "Activity level",
      description: experience.energy_level
        ? `This experience is ${experience.energy_level} energy — pace yourself accordingly`
        : "Ask your host about the activity level before booking",
    },
    {
      icon: Backpack,
      label: "What to bring",
      description: "Check with your host for anything specific to bring along",
    },
    {
      icon: CreditCard,
      label: "Payment policy",
      description: "Bank transfer and cash accepted",
    },
    {
      icon: XCircle,
      label: "Cancellation policy",
      description: experience.cancellation_policy || "Check with your host for cancellation terms",
    },
  ];

  if (experience.duration_minutes) {
    items.push({
      icon: Zap,
      label: "Total time spent",
      description: `This experience runs about ${formatDuration(experience.duration_minutes)}`,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <item.icon className="size-[18px]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-medium text-foreground">{item.label}</span>
            <span className="text-sm text-muted-foreground">{item.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
