import type { ThreeStepItem } from "../model/become-a-guide.types";

export interface ThreeStepsSectionProps {
  steps: ThreeStepItem[];
}

export function ThreeStepsSection({ steps }: ThreeStepsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1360px] px-4 py-16 sm:px-8 sm:py-24">
      {/* Section Header */}
      <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#2C0101] sm:text-4xl lg:text-5xl">
        Three steps. The middle one is ours.
      </h2>

      {/* 3 Step Cards */}
      <div className="mt-10 grid grid-cols-1 items-stretch gap-6 sm:mt-12 sm:gap-8 md:grid-cols-3">
        {steps.map((step) => {
          if (step.isHighlighted) {
            return (
              <div
                key={step.step}
                className="flex flex-col justify-between rounded-[24px] bg-[#F5032D] p-8 text-white shadow-lg sm:p-10"
              >
                <div>
                  <span className="font-sans text-xs font-bold tracking-wider text-white/90 uppercase">
                    {step.step}
                  </span>
                  <h3 className="mt-4 font-sans text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 font-sans text-sm leading-relaxed text-white/95 sm:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={step.step}
              className="flex flex-col justify-between rounded-[24px] bg-[#F4F2EE] p-8 text-[#130404] sm:p-10"
            >
              <div>
                <span className="font-sans text-xs font-bold tracking-wider text-[#6F6B72] uppercase">
                  {step.step}
                </span>
                <h3 className="mt-4 font-sans text-xl font-bold text-[#130404] sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-4 font-sans text-sm leading-relaxed text-[#333134] sm:text-base">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
