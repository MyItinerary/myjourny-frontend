"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { HomeNav } from "@/components/home/home-nav";
import { suggestedDestinations } from "@/lib/mock-data/home";

// Figma: "Hero" (2001:9143 guest / 2001:9153 account) — pixel-identical
// between the two states, so this ships as one shared component.
export function HeroSection() {
  return (
    <section className="relative z-20 bg-gradient-to-b from-muted to-white">
      <HomeNav />

      <div className="mx-auto flex w-full max-w-[1512px] flex-col items-start px-6 pt-[50px] pb-[64px] text-left lg:px-[306px] lg:pt-[77px] lg:pb-[90px]">
        <div className="flex flex-col items-start gap-4 text-left lg:gap-5">
          {/* Mobile headline is Midnight Earth (#2c0101); desktop is #130404. */}
          <h1 className="font-heading text-[32px] leading-[1.2] font-extrabold text-[#2c0101] lg:text-[52px] lg:text-[#130404]">
            Your city is full of things worth doing, Start with one.
          </h1>
          <p className="max-w-[508px] text-lg leading-[28px] text-muted-foreground lg:text-2xl lg:leading-normal">
            Real experiences hosted by real people, booked in under 2 minutes.
          </p>
        </div>

        {/* Mobile: compact "Where to?" pill (2001:8004); desktop: 3-field bar. */}
        <button
          type="button"
          className="mt-[76px] flex w-full items-center gap-[7px] rounded-full border border-[#c7c1ba] bg-white p-4 text-left lg:hidden"
        >
          <span className="min-w-0 flex-1 text-base leading-6 text-muted-foreground">Where to?</span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand">
            <Image src="/icons/search-lg.svg" alt="" width={16} height={16} className="invert" />
          </span>
        </button>
        <SearchBar className="mt-8 hidden w-full max-w-[900px] lg:mt-12 lg:flex" />
      </div>
    </section>
  );
}

function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"where" | "when" | "who" | null>(null);
  const [selectedWhere, setSelectedWhere] = useState<string>("");
  const [selectedWhereId, setSelectedWhereId] = useState<string>("");
  const [selectedWhen, setSelectedWhen] = useState<string>("");
  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    infants: 0,
  });
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // August 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(1); // 1st active by default per design
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const totalGuests = guests.adults + guests.children + guests.infants;
  const whoSummary =
    totalGuests > 0
      ? `${totalGuests} guest${totalGuests > 1 ? "s" : ""}${guests.infants > 0 ? `, ${guests.infants} infant${guests.infants > 1 ? "s" : ""}` : ""}`
      : "Select guests";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthName = monthNames[currentMonth];

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const guestTypes = [
    {
      key: "adults" as const,
      label: "Adults",
      description: "Aged 13 or above",
    },
    {
      key: "children" as const,
      label: "Children",
      description: "Ages 2 - 12",
    },
    {
      key: "infants" as const,
      label: "Infants",
      description: "Under 2",
    },
  ];

  return (
    <div
      ref={searchBarRef}
      className={cn(
        "relative flex flex-col gap-2 rounded-[28px] border border-[#c7c1ba] bg-white p-2 lg:flex-row lg:items-center lg:gap-[9px] lg:rounded-[57px]",
        className
      )}
    >
      <div className="flex flex-1 flex-col divide-y divide-[#e0dfdd] lg:flex-row lg:items-center lg:divide-y-0">
        {/* Where Tab */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "where" ? null : "where")}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-4 py-2 text-left transition-colors",
            activeTab === "where" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/50"
          )}
        >
          <span className="text-xs text-foreground">Where</span>
          <span className="text-sm text-muted-foreground line-clamp-1">
            {selectedWhere || "Where are you looking to explore?"}
          </span>
        </button>

        <div className={cn("hidden h-8 w-px bg-[#e0dfdd] lg:block", (activeTab === "where" || activeTab === "when") && "opacity-0")} />

        {/* When Tab */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "when" ? null : "when")}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-4 py-2 text-left transition-colors",
            activeTab === "when" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/50"
          )}
        >
          <span className="text-xs text-foreground">When</span>
          <span className="text-sm text-muted-foreground line-clamp-1">
            {selectedWhen || "Select dates"}
          </span>
        </button>

        <div className={cn("hidden h-8 w-px bg-[#e0dfdd] lg:block", (activeTab === "when" || activeTab === "who") && "opacity-0")} />

        {/* Who Tab */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "who" ? null : "who")}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-4 py-2 text-left transition-colors",
            activeTab === "who" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/50"
          )}
        >
          <span className="text-xs text-foreground">Who</span>
          <span className="text-sm text-muted-foreground line-clamp-1">
            {whoSummary}
          </span>
        </button>
      </div>

      <button
        type="button"
        aria-label="Search"
        disabled={!selectedWhereId}
        onClick={() => selectedWhereId && router.push(`/cities/${selectedWhereId}`)}
        className="flex size-11 shrink-0 items-center justify-center self-end rounded-full bg-brand text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
      >
        <Image src="/icons/search-lg.svg" alt="" width={20} height={20} className="invert" />
      </button>

      {/* Suggested Destinations Dropdown Modal */}
      {activeTab === "where" && (
        <div className="absolute top-[calc(100%+12px)] left-0 z-50 flex w-[430px] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <span className="text-[12px] font-medium leading-[18px] text-black">
            Suggested Destinations
          </span>
          <div className="flex w-full flex-col gap-2">
            {suggestedDestinations.map((dest) => (
              <button
                key={dest.id}
                type="button"
                onClick={() => {
                  setSelectedWhere(dest.city);
                  setSelectedWhereId(dest.id);
                  setActiveTab(null);
                  router.push(`/cities/${dest.id}`);
                }}
                className="flex w-full items-center gap-[14.5px] rounded-xl p-1 text-left transition-colors hover:bg-[#F4F2EE]/70"
              >
                <div className="flex size-[48px] shrink-0 items-center justify-center rounded-[9.938px] bg-[#F4F2EE] p-[11.594px]">
                  <Image
                    src="/icons/pin-destination.svg"
                    alt=""
                    width={20}
                    height={25}
                    className="h-[24.844px] w-[19.875px]"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold leading-6 text-[#130404]">
                    {dest.city}
                  </span>
                  <span className="text-sm leading-5 text-[#6F6B72]">
                    {dest.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Dropdown Modal */}
      {activeTab === "when" && (
        <div className="absolute top-[calc(100%+12px)] left-0 lg:left-[170px] z-50 flex w-[430px] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2">
            {["Today", "Tomorrow", "This weekend"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSelectedWhen(preset);
                  setActiveTab(null);
                }}
                className="rounded-[20px] border border-[#E0E0E0] bg-white px-3 py-0.5 text-center font-sans text-[12px] font-normal leading-[24px] text-[#130404] transition-colors hover:bg-[#F4F2EE]"
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3 pt-1">
            {/* Days of week header */}
            <div className="grid grid-cols-7 text-center font-sans text-[12px] font-normal leading-4 text-[#6F6B72]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Month header */}
            <div className="flex items-center justify-between py-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="flex size-8 items-center justify-center rounded-full text-[#130404] transition-colors hover:bg-[#F4F2EE]"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-sans text-base font-bold leading-6 text-[#130404]">
                {monthName}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="flex size-8 items-center justify-center rounded-full text-[#130404] transition-colors hover:bg-[#F4F2EE]"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Dates grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 w-full" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                return (
                  <div key={day} className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedWhen(`${monthName} ${day}`);
                        setActiveTab(null);
                      }}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center text-center font-sans text-[14px] font-normal leading-[22px] transition-colors",
                        isSelected
                          ? "rounded-[8px] bg-[#F5032D] font-medium text-white shadow-sm"
                          : "rounded-[8px] text-[#333134] hover:bg-[#F4F2EE]"
                      )}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Who Guests Dropdown Modal */}
      {activeTab === "who" && (
        <div className="absolute top-[calc(100%+12px)] right-0 lg:right-4 z-50 flex w-[430px] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="flex w-full flex-col gap-6">
            {guestTypes.map((type) => (
              <div key={type.key} className="flex w-full items-center justify-between">
                <div className="flex flex-col items-start self-stretch">
                  <span className="font-sans text-[18px] font-medium leading-[27px] text-[#130404]">
                    {type.label}
                  </span>
                  <span className="font-sans text-[14px] font-normal leading-[22px] text-[#6F6B72]">
                    {type.description}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={guests[type.key] <= 0}
                    onClick={() =>
                      setGuests((prev) => ({
                        ...prev,
                        [type.key]: Math.max(0, prev[type.key] - 1),
                      }))
                    }
                    aria-label={`Decrease ${type.label}`}
                    className="flex size-8 items-center justify-center rounded-[22px] bg-[#F4F2EE] transition-colors hover:bg-[#eae7e1] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="2" viewBox="0 0 14 2" fill="none" className="w-[11.667px]">
                      <path d="M1 1H12.6667" stroke={guests[type.key] > 0 ? "#6F6B72" : "#CDCDCD"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="min-w-[16px] text-center font-sans text-base font-semibold text-[#130404]">
                    {guests[type.key]}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setGuests((prev) => ({
                        ...prev,
                        [type.key]: prev[type.key] + 1,
                      }))
                    }
                    aria-label={`Increase ${type.label}`}
                    className="flex size-8 items-center justify-center rounded-[22px] bg-[#F4F2EE] transition-colors hover:bg-[#eae7e1]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" className="size-[11.667px]">
                      <path d="M6.83333 1V12.6667M1 6.83333H12.6667" stroke="#6F6B72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
