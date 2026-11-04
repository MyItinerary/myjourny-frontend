"use client";

import Link from "next/link";

import type { DocumentQuestions, ReadNextItem } from "../model/terms.types";
import { FormattedText } from "./formatted-text";

export interface ReadNextCardsProps {
  title?: string;
  items: ReadNextItem[];
  documentQuestions?: DocumentQuestions;
}

export function ReadNextCards({
  title = "Read next",
  items,
  documentQuestions,
}: ReadNextCardsProps) {
  return (
    <div className="mt-14 border-t border-[#EBEBEB] pt-10">
      <h2 className="mb-4 font-sans text-xl font-bold text-[#130404]">
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="group flex flex-col justify-start rounded-2xl border border-[#EBEBEB] bg-white p-5 transition-all hover:border-[#130404] hover:shadow-xs"
          >
            <p className="font-sans text-xs font-bold tracking-wider text-[#E11D48] uppercase">
              {item.eyebrow}
            </p>
            <h3 className="mt-1 font-sans text-base font-bold text-[#130404] group-hover:underline">
              {item.title}
            </h3>
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-[#6F6B72]">
              {item.description}
            </p>
          </Link>
        ))}
      </div>

      {documentQuestions && (
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-[#F7F5F0] p-5 sm:p-6">
          <p className="font-sans text-sm leading-relaxed text-[#333134]">
            <FormattedText text={documentQuestions.text} />
          </p>
          {documentQuestions.previousVersionsHref && (
            <Link
              href={documentQuestions.previousVersionsHref}
              className="shrink-0 font-sans text-sm font-medium text-[#130404] underline hover:text-[#E11D48]"
            >
              {documentQuestions.previousVersionsText ?? "Previous versions"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
