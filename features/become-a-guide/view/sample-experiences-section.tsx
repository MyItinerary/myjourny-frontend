import Image from "next/image";
import Link from "next/link";

import type { SampleExperienceItem } from "../model/become-a-guide.types";

export interface SampleExperiencesSectionProps {
  experiences: SampleExperienceItem[];
  isLoading?: boolean;
}

export function SampleExperiencesSection({
  experiences,
  isLoading = false,
}: SampleExperiencesSectionProps) {
  return (
    <section className="w-full bg-[#F4F2EE] py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-8">
        {/* Section Header */}
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#2C0101] sm:text-4xl lg:text-5xl">
          Sample experiences
        </h2>

        {/* Experiences Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && experiences.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  data-testid="sample-experience-skeleton"
                  className="flex flex-col overflow-hidden rounded-[20px] border border-[#EBEBEB] bg-white shadow-xs"
                >
                  <div className="aspect-[4/3] w-full animate-pulse bg-[#E5E0D8]" />
                  <div className="space-y-2 p-4 sm:p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#EBEBEB]" />
                    <div className="h-4 w-36 animate-pulse rounded bg-[#EBEBEB]" />
                    <div className="h-3 w-24 animate-pulse rounded bg-[#EBEBEB]" />
                  </div>
                </div>
              ))
            : experiences.map((exp) => (
                <Link
                  key={exp.id}
                  href={exp.href || `/experiences/${exp.id}`}
                  className="group flex flex-col overflow-hidden rounded-[20px] border border-[#EBEBEB] bg-white shadow-xs transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Image Container with Photo Tag */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E5E0D8]">
                    {exp.imageUrl ? (
                      <Image
                        src={exp.imageUrl}
                        alt={exp.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#E5E0D8]" />
                    )}

                    {/* Photo Pill Badge */}
                    <div
                      aria-hidden="true"
                      className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 backdrop-blur-xs"
                    >
                      <span className="font-sans text-[11px] font-medium text-[#333134]">Photo</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    <div>
                      <p className="font-sans text-[11px] font-extrabold tracking-wider text-[#F5032D] uppercase">
                        {exp.category}
                      </p>
                      <h3 className="mt-1 line-clamp-1 font-sans text-sm font-bold text-[#130404] sm:text-base">
                        {exp.title}
                      </h3>
                    </div>

                    <p className="mt-2 font-sans text-xs font-normal text-[#6F6B72]">
                      {exp.priceFormatted} · {exp.guestCountFormatted}
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
