"use client";

import type { ChangeEvent } from "react";

import type { CalculatorOutputs, ProfessionOption } from "../model/become-a-guide.types";

export interface EarningsCalculatorSectionProps {
  professions: ProfessionOption[];
  selectedProfessionId: string;
  pricePerPerson: number;
  formattedPricePerPerson: string;
  groupSize: number;
  sessionsPerMonth: number;
  earnings: CalculatorOutputs;
  onSelectProfession: (id: string) => void;
  onPriceChange: (price: number) => void;
  onGroupSizeChange: (size: number) => void;
  onSessionsChange: (sessions: number) => void;
}

export function EarningsCalculatorSection({
  professions,
  selectedProfessionId,
  pricePerPerson,
  formattedPricePerPerson,
  groupSize,
  sessionsPerMonth,
  earnings,
  onSelectProfession,
  onPriceChange,
  onGroupSizeChange,
  onSessionsChange,
}: EarningsCalculatorSectionProps) {
  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    onPriceChange(Number(e.target.value));
  };

  const handleGroupSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onGroupSizeChange(Number(e.target.value));
  };

  const handleSessionsChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSessionsChange(Number(e.target.value));
  };

  return (
    <section id="calculator" className="w-full bg-[#F4F2EE] py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-8">
        <h2 className="mb-10 font-sans text-3xl font-extrabold tracking-tight text-[#2C0101] sm:text-4xl lg:text-5xl">
          Do the calculations yourself.
        </h2>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left White Container: Controls */}
          <div className="flex flex-col justify-between rounded-[16px] border border-[#EBEBEB] bg-white p-6 shadow-sm sm:p-9 lg:col-span-7">
            <div>
              <p className="font-sans text-sm font-bold text-[#130404]">What do you do?</p>

              {/* Profession Pills */}
              <div className="mt-4 flex flex-wrap gap-2.5">
                {professions.map((prof) => {
                  const isSelected = prof.id === selectedProfessionId;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => onSelectProfession(prof.id)}
                      className={`cursor-pointer rounded-full px-4 py-2 font-sans text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-[#F5032D] text-white shadow-xs"
                          : "bg-[#F4F2EE] text-[#333134] hover:bg-[#EAE7E1]"
                      }`}
                    >
                      {prof.label}
                    </button>
                  );
                })}
              </div>

              {/* Sliders */}
              <div className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
                {/* Price per person slider */}
                <div>
                  <div className="flex items-center justify-between font-sans text-sm">
                    <span className="font-medium text-[#333134]">Price per person</span>
                    <span className="font-bold text-[#130404]">
                      {formattedPricePerPerson}
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Price per person"
                    min={2000}
                    max={100000}
                    step={1000}
                    value={pricePerPerson}
                    onChange={handlePriceChange}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#EAE7E1] accent-[#F5032D]"
                  />
                  <div className="mt-1.5 flex justify-between font-sans text-[11px] text-[#6F6B72]">
                    <span>₦2,000</span>
                    <span>₦100,000</span>
                  </div>
                </div>

                {/* Group size slider */}
                <div>
                  <div className="flex items-center justify-between font-sans text-sm">
                    <span className="font-medium text-[#333134]">Group size</span>
                    <span className="font-bold text-[#130404]">
                      {groupSize} guest{groupSize === 1 ? "" : "s"}
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Group size"
                    min={1}
                    max={30}
                    step={1}
                    value={groupSize}
                    onChange={handleGroupSizeChange}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#EAE7E1] accent-[#F5032D]"
                  />
                </div>

                {/* Sessions per month slider */}
                <div>
                  <div className="flex items-center justify-between font-sans text-sm">
                    <span className="font-medium text-[#333134]">Sessions per month</span>
                    <span className="font-bold text-[#130404]">{sessionsPerMonth}</span>
                  </div>
                  <input
                    type="range"
                    aria-label="Sessions per month"
                    min={1}
                    max={20}
                    step={1}
                    value={sessionsPerMonth}
                    onChange={handleSessionsChange}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#EAE7E1] accent-[#F5032D]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Dark Brown Container: Results */}
          <div className="flex w-full flex-col justify-between rounded-[16px] bg-[#2C0101] p-8 text-white shadow-md sm:p-10 lg:col-span-5 lg:min-h-[535px]">
            <div>
              <p className="font-sans text-xs font-medium text-[#D9D4CC]">Revenue per session</p>
              <h3 className="mt-1 font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {earnings.formattedRevenue}
              </h3>

              <div className="mt-8">
                <p className="font-sans text-xs font-semibold text-[#E8A93B]">
                  Your payout per session (85%)
                </p>
                <h3 className="mt-1 font-sans text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {earnings.formattedPayout}
                </h3>
              </div>

              <div className="mt-8">
                <p className="font-sans text-xs font-medium text-[#D9D4CC]">Monthly earnings</p>
                <h3 className="mt-1 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {earnings.formattedMonthly}
                </h3>
              </div>
            </div>

            <div className="mt-8 border-t border-[#4A1515] pt-6">
              <p className="font-sans text-xs font-medium text-white sm:text-sm">
                Running this once a week earns {earnings.formattedMonthly} a month.
              </p>
              <p className="mt-1 font-sans text-xs text-[#D9D4CC]">
                We take 15%. Card and transfer fees come out of our share, not yours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
