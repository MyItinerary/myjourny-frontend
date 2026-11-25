import { Lightbulb, ThumbsDown, ThumbsUp } from "lucide-react";

import { cn } from "@/lib/utils";

import type { BasicsField } from "../model/listing-draft.types";

type Tip = { label: string; lead: string; good: string; bad: string; footer?: string };

const TIPS: Record<BasicsField, Tip> = {
  title: {
    label: "Title",
    lead: "Say where it happens and what people do. That's what they search for.",
    good: "Lagos Island photowalk at golden hour",
    bad: "Amazing photography experience!!!",
  },
  hook: {
    label: "Short description",
    lead: "Most hosts describe the activity. The ones who sell out describe the feeling.",
    good: "Walk six streets on Lagos Island with a photographer who shows you where to stand. You leave with ten edited photos you'll actually post.",
    bad: "A 3 hour photography walk. We visit 6 locations. Photos included.",
  },
  desc: {
    label: "Long description",
    lead: "Walk people through it in order, as if they're already there.",
    good: "We meet at the yellow gate beside Freedom Park an hour before sunset. You don't need a camera or any idea how to pose. I'll tell you where to stand. We walk six streets I shoot every week and stop wherever the light is good. By the third street you'll stop checking the screen. Two days later, ten edited photos land in your inbox.",
    bad: "This is a photography tour of Lagos Island. It lasts 3 hours. We will visit 6 locations. Photos are included in the price. Suitable for all levels. Please be on time.",
    footer: "Three things worth answering: what will people feel, what will they leave with, and who is it not for?",
  },
};

function Sample({ good, text }: { good: boolean; text: string }) {
  const Icon = good ? ThumbsUp : ThumbsDown;
  return (
    <div className="flex gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-[inset_0_0_0_1px_#E7E7E7]">
      <Icon
        role="img"
        aria-label={good ? "Good" : "Not so good"}
        className={cn("mt-0.5 size-4 shrink-0", good ? "text-[#0CBA65]" : "text-[#F5032D]")}
        strokeWidth={1.9}
      />
      <p className={cn("text-[13px] leading-relaxed", good ? "text-[#333134]" : "text-[#6F6B72]")}>{text}</p>
    </div>
  );
}

// Beside the first step: a good and a weak example for the field being typed in.
export function HostBuilderTipsView({ field }: { field: BasicsField }) {
  const tip = TIPS[field];
  return (
    <aside aria-label={`Tips for the ${tip.label.toLowerCase()}`} className="rounded-2xl bg-[#FAF9F7] p-4 shadow-[inset_0_0_0_1px_#E9E1D2]">
      <h3 className="mb-2 text-[11px] font-medium tracking-[0.06em] text-[#6F6B72] uppercase">{tip.label}</h3>
      <div className="mb-3.5 flex items-start gap-2.5">
        <Lightbulb aria-hidden className="mt-px size-[18px] shrink-0 text-[#333134]" />
        <p className="text-[13.5px] leading-snug font-medium text-[#333134]">{tip.lead}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Sample good text={tip.good} />
        <Sample good={false} text={tip.bad} />
      </div>
      {tip.footer && <p className="mt-3.5 text-xs leading-relaxed text-[#6F6B72]">{tip.footer}</p>}
    </aside>
  );
}
