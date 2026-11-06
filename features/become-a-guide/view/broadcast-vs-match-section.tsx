import { ArrowRight, Check } from "lucide-react";

export function BroadcastVsMatchSection() {
  // 24 dots representing broadcast followers (mostly grey #D9D4CC, two golden #E8A93B)
  const broadcastDots = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    isMatch: i === 5 || i === 14,
  }));

  // 8 dots representing high-intent matched bookings (all golden #E8A93B)
  const matchedDots = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
  }));

  return (
    <section className="mx-auto w-full max-w-[1360px] px-4 py-16 sm:px-8 sm:py-24">
      {/* Section Header */}
      <div className="max-w-2xl">
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#130404] sm:text-4xl lg:text-5xl">
          Your followers are a broadcast.
          <br />
          Ours are a <span className="text-[#F5032D]">match</span>.
        </h2>

        <p className="mt-4 font-sans text-sm leading-relaxed text-[#6F6B72] sm:text-base">
          Everyone who books on MyJourny told us what they are drawn to: their pace, their
          budget, who they go with, what they want out of it. We put your experience in front
          of the ones it actually fits, and we bring you people who have never heard of you.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="mt-12 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left Container: Posting it yourself */}
        <div className="flex flex-col rounded-[16px] bg-[#F4F2EE] p-6 sm:p-9 lg:col-span-6">
          <div className="inline-flex">
            <span className="rounded-full bg-white px-3.5 py-1.5 font-sans text-xs font-semibold text-[#333134] shadow-xs">
              Posting it yourself
            </span>
          </div>

          {/* Followers Dot Matrix */}
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-2.5">
            {broadcastDots.map((dot) => (
              <span
                key={dot.id}
                className={`size-3.5 rounded-[7px] ${
                  dot.isMatch ? "bg-[#E8A93B]" : "bg-[#D9D4CC]"
                }`}
              />
            ))}
          </div>

          <p className="mt-2.5 font-sans text-xs font-medium text-[#6F6B72]">
            2,000 followers see it. A few are a fit.
          </p>

          <ul className="mt-6 space-y-3 font-sans text-xs text-[#333134] sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#6F6B72]">→</span>
              <span>2,000 followers see it</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6F6B72]">→</span>
              <span>Most are not in Lagos, free that Saturday, or interested in this</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6F6B72]">→</span>
              <span>You chase people in DMs for payment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6F6B72]">→</span>
              <span>You find out who is coming when they show up</span>
            </li>
          </ul>
        </div>

        {/* Right Container: Listing on MyJourny */}
        <div className="flex flex-col rounded-[16px] bg-[#2C0101] p-6 text-white sm:p-9 lg:col-span-6">
          <div className="inline-flex">
            <span className="rounded-full bg-[#F5032D] px-3.5 py-1.5 font-sans text-xs font-semibold text-white">
              Listing on MyJourny
            </span>
          </div>

          {/* Matched Dots */}
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-2.5">
            {matchedDots.map((dot) => (
              <span key={dot.id} className="size-3.5 rounded-[7px] bg-[#E8A93B]" />
            ))}
          </div>

          <p className="mt-2.5 font-sans text-xs font-medium text-[#D9D4CC]">
            Fewer people, every one a fit.
          </p>

          <ul className="mt-6 space-y-3 font-sans text-xs text-white sm:text-sm">
            <li className="flex items-start gap-2">
              <Check className="size-4 shrink-0 stroke-[2.5] text-[#E8A93B]" />
              <span>Shown to people who told us they like exactly this</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-4 shrink-0 stroke-[2.5] text-[#E8A93B]" />
              <span>They book and pay in two minutes</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-4 shrink-0 stroke-[2.5] text-[#E8A93B]" />
              <span>Money is held and released to you after</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-4 shrink-0 stroke-[2.5] text-[#E8A93B]" />
              <span>You know your numbers before the day</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Taste Profile Match Card */}
      <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-[24px] border border-[#EBEBEB] bg-white p-6 shadow-xs sm:p-8 md:flex-row">
        {/* Left: Taste profile tags */}
        <div className="w-full md:w-auto">
          <p className="font-sans text-[11px] font-bold tracking-wider text-[#6F6B72] uppercase">
            Example taste profile
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#E5EDF5] px-4 py-1.5 font-sans text-xs font-medium text-[#1E3A8A]">
              Relaxed pace
            </span>
            <span className="rounded-full bg-[#E5EDF5] px-4 py-1.5 font-sans text-xs font-medium text-[#1E3A8A]">
              Small group
            </span>
            <span className="rounded-full bg-[#E5EDF5] px-4 py-1.5 font-sans text-xs font-medium text-[#1E3A8A]">
              Art and creativity
            </span>
            <span className="rounded-full bg-[#E5EDF5] px-4 py-1.5 font-sans text-xs font-medium text-[#1E3A8A]">
              Mid-range
            </span>
          </div>
        </div>

        {/* Center: Matches arrow */}
        <div className="flex items-center gap-1.5 font-sans text-sm font-bold text-[#F5032D]">
          <span>matches</span>
          <ArrowRight className="size-4 stroke-[2.5]" />
        </div>

        {/* Right: Matched Experience Card */}
        <div className="flex w-full items-center gap-4 rounded-[18px] border border-[#EFECE6] bg-[#FAF9F7] p-3.5 sm:w-auto sm:min-w-[320px]">
          <div className="size-16 shrink-0 rounded-[14px] bg-[#E5E0D8]" />
          <div>
            <p className="font-sans text-[10px] font-extrabold tracking-wider text-[#F5032D] uppercase">
              Art and creativity
            </p>
            <p className="font-sans text-sm font-bold text-[#130404]">
              Adire dyeing workshop
            </p>
            <p className="mt-0.5 font-sans text-xs text-[#6F6B72]">
              ₦15,000 · 10 guests
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
