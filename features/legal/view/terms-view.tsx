"use client";

import { Check, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { TermsViewModel } from "../view-model/use-terms-view-model";
import { CancellationTiersChart } from "./cancellation-tiers-chart";

export function FormattedText({ text }: { text: string }) {
  if (!text) return null;
  if (!text.includes("**") && !text.includes("[")) {
    return <>{text}</>;
  }

  // Matches either **bold text** or [link text](url)
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-[#130404]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
          const closeBracket = part.indexOf("](");
          const label = part.slice(1, closeBracket);
          const href = part.slice(closeBracket + 2, -1);
          return (
            <Link
              key={i}
              href={href}
              className="text-[#E11D48] underline hover:text-[#BE123C]"
            >
              {label}
            </Link>
          );
        }
        return part;
      })}
    </>
  );
}

export function TermsView({
  data,
  activeSectionId,
  backHref,
  backLabel,
  onSectionSelect,
}: TermsViewModel) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page Title */}
      <div className="mb-10 text-center sm:mb-14">
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#130404] sm:text-5xl">
          {data.title}
        </h1>
        <p className="mt-3 font-sans text-sm text-[#6F6B72]">
          Last updated: <span className="font-medium text-[#130404]">{data.lastUpdated}</span>
        </p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left Sticky Sidebar / Table of Contents */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[260px]">
          <div className="rounded-xl border border-[#EBEBEB] bg-[#FAF9F7] p-4 lg:border-0 lg:bg-transparent lg:p-0">
            <h2 className="mb-3 font-sans text-xs font-bold tracking-wider text-[#6F6B72] uppercase">
              On this page
            </h2>
            <nav aria-label="Table of contents" className="flex flex-col space-y-1">
              {data.tableOfContents.map((item) => {
                if (item.isPartHeading) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSectionSelect(item.id)}
                      className="pt-5 pb-1 text-left font-sans text-xs font-bold tracking-wider text-[#6F6B72] uppercase transition-colors hover:text-[#130404] cursor-pointer"
                    >
                      {item.label}
                    </button>
                  );
                }

                const isActive = activeSectionId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSectionSelect(item.id)}
                    className={cn(
                      "block text-left font-sans text-sm transition-colors py-1.5 pl-3 border-l-2 cursor-pointer",
                      isActive
                        ? "border-[#E11D48] font-semibold text-[#130404]"
                        : "border-transparent text-[#6F6B72] hover:border-[#E0DFDD] hover:text-[#130404]"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {backHref && backLabel && (
              <div className="mt-8 pt-4 border-t border-[#EBEBEB] lg:border-0 lg:pt-6">
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-[#6F6B72] transition-colors hover:text-[#130404]"
                >
                  <ChevronLeft className="size-4" />
                  <span>{backLabel}</span>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="min-w-0 flex-1 max-w-[760px]">
          {/* Introductory Clauses */}
          <div className="space-y-4 font-sans text-base leading-relaxed text-[#333134]">
            <p>
              <FormattedText text={data.companyAgreementText} />
            </p>
            {data.agreementNoticeText && (
              <p>
                <FormattedText text={data.agreementNoticeText} />
              </p>
            )}
          </div>

          {/* The Short Version Card */}
          <section
            id="short-version"
            className="my-10 scroll-mt-24 rounded-[20px] bg-[#F7F5F0] p-6 sm:p-8"
          >
            <h2 className="mb-4 font-sans text-xl font-bold text-[#130404]">
              {data.shortVersion.title}
            </h2>
            <ul className="space-y-3.5">
              {data.shortVersion.items.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#E11D48] text-white">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                  <span className="font-sans text-sm leading-relaxed text-[#333134]">
                    <FormattedText text={item.text} />
                  </span>
                </li>
              ))}
            </ul>
            {data.shortVersion.disclaimer && (
              <div className="mt-6 border-t border-[#EAE7E0] pt-4 font-sans text-xs text-[#6F6B72]">
                {data.shortVersion.disclaimer}
              </div>
            )}
          </section>

          {/* Detailed Terms Sections */}
          <div className="space-y-12">
            {data.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                {section.eyebrow && (
                  <div className="border-t border-[#EBEBEB] pt-8">
                    <p className="font-sans text-xs font-bold tracking-wider text-[#E11D48] uppercase">
                      {section.eyebrow}
                    </p>
                  </div>
                )}
                <h2 className="font-sans text-xl font-bold text-[#130404] sm:text-2xl">
                  {section.title}
                </h2>
                {section.intro && (
                  <p className="font-sans text-base leading-relaxed text-[#333134]">
                    <FormattedText text={section.intro} />
                  </p>
                )}

                {section.id === "schedule-3" && <CancellationTiersChart />}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-2 pl-4 list-disc marker:text-[#E11D48]">
                    {section.bullets.map((bullet, idx) => (
                      <li key={idx} className="font-sans text-base leading-relaxed text-[#333134]">
                        <FormattedText text={bullet} />
                      </li>
                    ))}
                  </ul>
                )}

                {section.items && section.items.length > 0 && (
                  <div className="space-y-4">
                    {section.items.map((item, index) => (
                      <div key={`${section.id}-${index}`} className="space-y-2">
                        <p className="font-sans text-base leading-relaxed text-[#333134]">
                          {item.number && <span className="mr-2 font-normal">{item.number}</span>}
                          {item.boldPrefix && (
                            <strong className="mr-1.5 font-bold text-[#130404]">
                              {item.boldPrefix}
                            </strong>
                          )}
                          <span>
                            <FormattedText text={item.text} />
                          </span>
                        </p>

                        {item.bullets && item.bullets.length > 0 && (
                          <ul className="space-y-2 pl-6 list-disc marker:text-[#E11D48]">
                            {item.bullets.map((subBullet, subIdx) => {
                              if (typeof subBullet === "string") {
                                return (
                                  <li
                                    key={subIdx}
                                    className="font-sans text-base leading-relaxed text-[#333134]"
                                  >
                                    <FormattedText text={subBullet} />
                                  </li>
                                );
                              }
                              return (
                                <li
                                  key={subIdx}
                                  className="font-sans text-base leading-relaxed text-[#333134]"
                                >
                                  {subBullet.boldPrefix && (
                                    <strong className="mr-1.5 font-bold text-[#130404]">
                                      {subBullet.boldPrefix}
                                    </strong>
                                  )}
                                  <span>
                                    <FormattedText text={subBullet.text} />
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
