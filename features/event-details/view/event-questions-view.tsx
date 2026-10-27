import { Minus, Plus } from "lucide-react";

import type { EventDetail } from "../model/event-details.types";

/** Frequently asked questions: one answer open at a time. */
export function EventQuestionsView({
  questions,
  openId,
  onToggle,
}: {
  questions: EventDetail["questions"];
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {questions.map((item) => {
        const open = item.id === openId;
        const Icon = open ? Minus : Plus;
        return (
          <div key={item.id} className="border-b border-[#E7E7E7] py-[18px]">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`answer-${item.id}`}
              onClick={() => onToggle(item.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
            >
              <span className="font-sans text-[17px] leading-6 font-medium text-[#333134]">{item.question}</span>
              <Icon className="size-5 shrink-0 text-[#333134]" aria-hidden />
            </button>
            {open && (
              <p id={`answer-${item.id}`} className="pt-2 font-sans text-base leading-[25px] text-[#6F6B72]">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
