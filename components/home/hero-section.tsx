"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";
import { HomeNav } from "@/components/home/home-nav";
import { computeDatePresets, DatePickerCalendar } from "@/components/shared/date-picker-calendar";
import { suggestedDestinations } from "@/lib/mock-data/home";

// Headline -> subtext -> search bar, staggered on mount (above the fold,
// so this plays immediately rather than on scroll — see components/motion/reveal.tsx
// for the scroll-triggered version used everywhere else on the homepage).
const heroContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Figma: "Hero" (2001:9143 guest / 2001:9153 account) — pixel-identical
// between the two states, so this ships as one shared component.
export function HeroSection() {
  return (
    <section className="relative z-20 bg-gradient-to-b from-muted to-white">
      <HomeNav />

      <motion.div
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-[1512px] flex-col items-start px-6 pt-[50px] pb-[64px] text-left lg:px-[306px] lg:pt-[77px] lg:pb-[90px]"
      >
        <div className="flex flex-col items-start gap-4 text-left lg:gap-5">
          <motion.h1
            variants={heroItemVariants}
            className="font-heading text-[32px] font-extrabold leading-[1.2] text-[#2c0101] lg:text-[52px] lg:leading-[62.4px] lg:text-[#130404]"
          >
            Your city is full of things worth doing, Start with one.
          </motion.h1>
          <motion.p
            variants={heroItemVariants}
            className="max-w-[508px] font-sans text-lg font-normal leading-[28px] text-[#6F6B72] lg:text-[24px] lg:leading-normal"
          >
            Real experiences hosted by real people, booked in under 2 minutes.
          </motion.p>
        </div>

        <motion.div variants={heroItemVariants} className="w-full">
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
        </motion.div>
      </motion.div>
    </section>
  );
}

function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"where" | "when" | "who" | null>(null);
  const [selectedWhere, setSelectedWhere] = useState<string>("");
  const [selectedWhereId, setSelectedWhereId] = useState<string>("");
  const [selectedWhen, setSelectedWhen] = useState<string>("");
  const [whoText, setWhoText] = useState<string>("");
  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    infants: 0,
  });
  // 1st of the current month active by default per design — text stays
  // empty ("Select dates") until the user actually picks something.
  const [selectedDate, setSelectedDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const searchBarRef = useRef<HTMLDivElement>(null);
  const whereInputRef = useRef<HTMLInputElement>(null);
  const whenInputRef = useRef<HTMLInputElement>(null);
  const whoInputRef = useRef<HTMLInputElement>(null);

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

  function updateGuests(newGuests: typeof guests) {
    setGuests(newGuests);
    const total = newGuests.adults + newGuests.children + newGuests.infants;
    if (total > 0) {
      setWhoText(
        `${total} guest${total > 1 ? "s" : ""}${newGuests.infants > 0 ? `, ${newGuests.infants} infant${newGuests.infants > 1 ? "s" : ""}` : ""}`
      );
    } else {
      setWhoText("");
    }
  }

  function handleSearch() {
    const trimmed = selectedWhere.trim().toLowerCase();
    if (!trimmed) return;

    if (selectedWhereId) {
      router.push(`/cities/${selectedWhereId}`);
      return;
    }

    const matchedDest = suggestedDestinations.find(
      (d) =>
        d.city.toLowerCase().includes(trimmed) ||
        d.id.toLowerCase().includes(trimmed) ||
        trimmed.includes(d.id.toLowerCase())
    );

    if (matchedDest) {
      router.push(`/cities/${matchedDest.id}`);
    } else {
      router.push(`/cities/lagos`);
    }
  }

  const filteredDestinations = selectedWhere.trim()
    ? suggestedDestinations.filter(
        (dest) =>
          dest.city.toLowerCase().includes(selectedWhere.toLowerCase()) ||
          dest.description.toLowerCase().includes(selectedWhere.toLowerCase())
      )
    : suggestedDestinations;

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
        <div
          onClick={() => {
            setActiveTab("where");
            whereInputRef.current?.focus();
          }}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-4 py-2 text-left transition-colors cursor-pointer",
            activeTab === "where" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/50"
          )}
        >
          <label htmlFor="search-where" className="text-xs font-medium text-foreground cursor-pointer">
            Where
          </label>
          <input
            id="search-where"
            ref={whereInputRef}
            type="text"
            value={selectedWhere}
            placeholder="Where are you looking to explore?"
            onFocus={() => setActiveTab("where")}
            onChange={(e) => {
              setSelectedWhere(e.target.value);
              setSelectedWhereId("");
              if (activeTab !== "where") setActiveTab("where");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="w-full border-0 bg-transparent p-0 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 leading-tight"
          />
        </div>

        <div className={cn("hidden h-8 w-px bg-[#e0dfdd] lg:block", (activeTab === "where" || activeTab === "when") && "opacity-0")} />

        {/* When Tab */}
        <div
          onClick={() => {
            setActiveTab("when");
            whenInputRef.current?.focus();
          }}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-4 py-2 text-left transition-colors cursor-pointer",
            activeTab === "when" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/50"
          )}
        >
          <label htmlFor="search-when" className="text-xs font-medium text-foreground cursor-pointer">
            When
          </label>
          <input
            id="search-when"
            ref={whenInputRef}
            type="text"
            value={selectedWhen}
            placeholder="Select dates"
            onFocus={() => setActiveTab("when")}
            onChange={(e) => {
              setSelectedWhen(e.target.value);
              if (activeTab !== "when") setActiveTab("when");
            }}
            className="w-full border-0 bg-transparent p-0 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 leading-tight"
          />
        </div>

        <div className={cn("hidden h-8 w-px bg-[#e0dfdd] lg:block", (activeTab === "when" || activeTab === "who") && "opacity-0")} />

        {/* Who Tab */}
        <div
          onClick={() => {
            setActiveTab("who");
            whoInputRef.current?.focus();
          }}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-4 py-2 text-left transition-colors cursor-pointer",
            activeTab === "who" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/50"
          )}
        >
          <label htmlFor="search-who" className="text-xs font-medium text-foreground cursor-pointer">
            Who
          </label>
          <input
            id="search-who"
            ref={whoInputRef}
            type="text"
            value={whoText}
            placeholder="Select guests"
            onFocus={() => setActiveTab("who")}
            onChange={(e) => {
              const val = e.target.value;
              setWhoText(val);
              const num = parseInt(val.replace(/\D/g, ""), 10);
              if (!isNaN(num)) {
                setGuests({ adults: num, children: 0, infants: 0 });
              }
              if (activeTab !== "who") setActiveTab("who");
            }}
            className="w-full border-0 bg-transparent p-0 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 leading-tight"
          />
        </div>
      </div>

      <button
        type="button"
        aria-label="Search"
        disabled={!selectedWhere.trim()}
        onClick={handleSearch}
        className="flex size-11 shrink-0 items-center justify-center self-end rounded-full bg-brand text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto cursor-pointer"
      >
        <Image src="/icons/search-lg.svg" alt="" width={20} height={20} className="invert" />
      </button>

      {/* Suggested Destinations Dropdown Modal */}
      {activeTab === "where" && (
        <div className="absolute top-[calc(100%+12px)] left-0 z-50 flex w-[430px] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <span className="text-[12px] font-medium leading-[18px] text-black">
            Suggested Destinations
          </span>
          <div className="flex w-full flex-col gap-2 max-h-[320px] overflow-y-auto">
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => {
                    setSelectedWhere(dest.city);
                    setSelectedWhereId(dest.id);
                    setActiveTab(null);
                    router.push(`/cities/${dest.id}`);
                  }}
                  className="flex w-full items-center gap-[14.5px] rounded-xl p-1 text-left transition-colors hover:bg-[#F4F2EE]/70 cursor-pointer"
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
              ))
            ) : (
              <p className="py-2 text-sm text-muted-foreground">No destinations found matching &ldquo;{selectedWhere}&rdquo;</p>
            )}
          </div>
        </div>
      )}

      {/* Calendar Dropdown Modal */}
      {activeTab === "when" && (
        <div className="absolute top-[calc(100%+12px)] left-0 lg:left-[170px] z-50 flex w-[430px] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <DatePickerCalendar
            selectedDate={selectedDate}
            presets={computeDatePresets()}
            onSelect={(date) => {
              setSelectedDate(date);
              const preset = computeDatePresets().find(
                (p) => p.date.toDateString() === date.toDateString()
              );
              setSelectedWhen(
                preset?.label ?? date.toLocaleDateString("en-US", { month: "long", day: "numeric" })
              );
              setActiveTab(null);
            }}
          />
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
                      updateGuests({
                        ...guests,
                        [type.key]: Math.max(0, guests[type.key] - 1),
                      })
                    }
                    aria-label={`Decrease ${type.label}`}
                    className="flex size-8 items-center justify-center rounded-[22px] bg-[#F4F2EE] transition-colors hover:bg-[#eae7e1] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
                      updateGuests({
                        ...guests,
                        [type.key]: guests[type.key] + 1,
                      })
                    }
                    aria-label={`Increase ${type.label}`}
                    className="flex size-8 items-center justify-center rounded-[22px] bg-[#F4F2EE] transition-colors hover:bg-[#eae7e1] cursor-pointer"
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
