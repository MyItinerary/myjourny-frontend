"use client";

import type { AtAGlanceItem } from "../model/terms.types";
import { FormattedText } from "./formatted-text";

export interface PrivacyAtAGlanceProps {
  title?: string;
  items: AtAGlanceItem[];
}

export function PrivacyAtAGlance({ title = "At a glance", items }: PrivacyAtAGlanceProps) {
  return (
    <section
      id="at-a-glance"
      className="my-10 scroll-mt-24 rounded-[20px] bg-[#F7F5F0] p-6 sm:p-8"
      aria-label={title}
    >
      <h2 className="mb-6 font-sans text-xl font-bold text-[#130404]">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col justify-start rounded-2xl bg-white p-5 shadow-xs"
          >
            <h3 className="mb-2 font-sans text-sm font-bold text-[#130404]">
              {item.question}
            </h3>
            <p className="font-sans text-sm leading-relaxed text-[#333134]">
              <FormattedText text={item.answer} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
