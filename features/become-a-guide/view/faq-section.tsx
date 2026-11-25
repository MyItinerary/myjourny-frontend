"use client";

import { Minus, Plus } from "lucide-react";

import type { FaqItem } from "../model/become-a-guide.types";

export interface FaqSectionProps {
  items: FaqItem[];
  openId: string | null;
  onToggle: (id: string) => void;
}

export function FaqSection({ items, openId, onToggle }: FaqSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[860px] px-4 py-16 sm:px-8 sm:py-24">
      {/* Section Header */}
      <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#2C0101] sm:text-4xl lg:text-5xl">
        Questions, answered
      </h2>

      {/* Accordion List */}
      <div className="mt-10 space-y-3 sm:mt-12 sm:space-y-3.5">
        {items.map((item) => {
          const isOpen = item.id === openId;
          return (
            <div
              key={item.id}
              className="rounded-[16px] bg-[#F4F2EE] px-6 py-4.5 transition-colors sm:px-7 sm:py-5"
            >
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-sans text-sm font-semibold text-[#130404] sm:text-base"
              >
                <span>{item.question}</span>
                <span className="flex size-5 shrink-0 items-center justify-center text-[#6F6B72]">
                  {isOpen ? (
                    <Minus className="size-4 stroke-[2.5]" aria-hidden="true" />
                  ) : (
                    <Plus className="size-4 stroke-[2.5]" aria-hidden="true" />
                  )}
                </span>
              </button>

              {isOpen && (
                <p className="mt-3 font-sans text-xs leading-relaxed text-[#6F6B72] sm:text-sm">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
