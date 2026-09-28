"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { computeDatePresets, DatePickerCalendar } from "@/components/shared/date-picker-calendar";
import { categoriesBySlug, suggestedDestinations } from "@/lib/mock-data/home";

export const allDestinations = [
  ...suggestedDestinations,
  { id: "abeokuta", city: "Abeokuta, Nigeria", description: "For its iconic rocks and heritage" },
  { id: "jos", city: "Jos, Nigeria", description: "For its cool highlands and scenic plateaus" },
  { id: "bauchi", city: "Bauchi, Nigeria", description: "For wildlife safaris and natural beauty" },
  { id: "kaduna", city: "Kaduna, Nigeria", description: "For its rich trade crossroads" },
  { id: "enugu", city: "Enugu, Nigeria", description: "For the coal city hills and culture" },
  { id: "benin-city", city: "Benin City, Nigeria", description: "For royal arts and ancient history" },
  { id: "kano", city: "Kano, Nigeria", description: "For historic city walls and dyeing pits" },
  { id: "owerri", city: "Owerri, Nigeria", description: "For lively nightlife and hospitality" },
];

export const popularActivities = [
  { id: "local-food-drinks", label: "Local food & drinks", subtitle: "Street eats, cafés, and culinary tours" },
  { id: "street-food-markets", label: "Street food & markets", subtitle: "Local delicacies and bustling night markets" },
  { id: "cafes-coffee-culture", label: "Cafés & coffee culture", subtitle: "Artisan coffee, cozy spots, and pastry shops" },
  { id: "bars-nightlife-drinks", label: "Bars & nightlife drinks", subtitle: "Cocktail bars, speakeasies, and rooftop lounges" },
  { id: "nightlife", label: "Nightlife", subtitle: "Clubs, lounges, and late-night spots" },
  { id: "culture-history", label: "Culture & history", subtitle: "Museums, heritage, and local stories" },
  { id: "museums-heritage-sites", label: "Museums & heritage sites", subtitle: "Historical landmarks, art galleries, and monuments" },
  { id: "local-traditions-festivals", label: "Local traditions & festivals", subtitle: "Cultural celebrations and traditional ceremonies" },
  { id: "historic-neighborhoods-landmarks", label: "Historic neighborhoods", subtitle: "Iconic districts, architecture, and heritage walks" },
  { id: "nature-outdoors", label: "Nature & outdoors", subtitle: "Fresh air, trails, and open spaces" },
  { id: "hiking-trails", label: "Hiking & trails", subtitle: "Scenic routes and guided outdoor walks" },
  { id: "beaches-waterfronts", label: "Beaches & waterfronts", subtitle: "Boat cruises, beach days, and coastal fun" },
  { id: "parks-green-spaces", label: "Parks & green spaces", subtitle: "Botanical gardens, picnic spots, and urban parks" },
  { id: "art-creativity", label: "Art & creativity", subtitle: "Galleries, murals, and creative workshops" },
  { id: "wellness-calm", label: "Wellness & calm", subtitle: "Spas, quiet spots, and yoga sessions" },
  { id: "street-life", label: "Street life", subtitle: "Markets, corners, and everyday city buzz" },
  { id: "events-live-shows", label: "Events & live shows", subtitle: "Concerts, festivals, and live music" },
];

export interface SearchBarProps {
  className?: string;
  variant?: "hero" | "nav";
  initialActiveTab?: "where" | "when" | "who" | null;
  onClose?: () => void;
}

export function SearchBar({
  className,
  variant = "hero",
  initialActiveTab = null,
  onClose,
}: SearchBarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"where" | "when" | "who" | null>(initialActiveTab);
  const [selectedWhere, setSelectedWhere] = useState<string>("");
  const [selectedWhereId, setSelectedWhereId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"destination" | "activity" | null>(null);
  const [selectedWhen, setSelectedWhen] = useState<string>("");
  const [whoText, setWhoText] = useState<string>("");
  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    infants: 0,
  });
  const [selectedDate, setSelectedDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const searchBarRef = useRef<HTMLDivElement>(null);
  const whereInputRef = useRef<HTMLInputElement>(null);
  const whenInputRef = useRef<HTMLInputElement>(null);
  const whoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
      if (initialActiveTab === "where") {
        setTimeout(() => whereInputRef.current?.focus(), 80);
      }
    }
  }, [initialActiveTab]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveTab(null);
        if (variant === "nav") {
          onClose?.();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, variant]);

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

  function handleSearch(customQuery?: string) {
    const rawQuery = customQuery ?? selectedWhere;
    const trimmed = rawQuery.trim().toLowerCase();
    if (!trimmed) return;
    const total = guests.adults + guests.children + guests.infants;
    if (!selectedWhen.trim() || total <= 0) return;

    onClose?.();

    if (selectedType === "activity" && selectedWhereId) {
      router.push(`/categories/${selectedWhereId}`);
      return;
    }

    if (selectedType === "destination" && selectedWhereId) {
      router.push(`/cities/${selectedWhereId}`);
      return;
    }

    const matchedDest = allDestinations.find(
      (d) =>
        d.city.toLowerCase().includes(trimmed) ||
        d.id.toLowerCase().includes(trimmed) ||
        trimmed.includes(d.id.toLowerCase())
    );

    const matchedAct = popularActivities.find(
      (a) =>
        a.label.toLowerCase().includes(trimmed) ||
        a.id.toLowerCase().includes(trimmed) ||
        trimmed.includes(a.id.toLowerCase()) ||
        a.subtitle?.toLowerCase().includes(trimmed)
    );

    if (matchedDest && !matchedAct) {
      router.push(`/cities/${matchedDest.id}`);
      return;
    }

    if (matchedAct) {
      router.push(`/categories/${matchedAct.id}`);
      return;
    }

    if (matchedDest) {
      router.push(`/cities/${matchedDest.id}`);
      return;
    }

    if (categoriesBySlug.has(trimmed)) {
      router.push(`/categories/${trimmed}`);
      return;
    }

    const slugified = trimmed.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    router.push(`/categories/${slugified}`);
  }

  const totalGuests = guests.adults + guests.children + guests.infants;
  const allFieldsFilled = !!selectedWhere.trim() && !!selectedWhen.trim() && totalGuests > 0;

  const trimmedQuery = selectedWhere.trim().toLowerCase();

  const filteredDestinations = trimmedQuery
    ? allDestinations.filter(
        (dest) =>
          dest.city.toLowerCase().includes(trimmedQuery) ||
          dest.id.toLowerCase().includes(trimmedQuery) ||
          dest.description.toLowerCase().includes(trimmedQuery)
      )
    : allDestinations.slice(0, 5);

  const filteredActivities = trimmedQuery
    ? popularActivities.filter(
        (act) =>
          act.label.toLowerCase().includes(trimmedQuery) ||
          act.id.toLowerCase().includes(trimmedQuery) ||
          act.subtitle.toLowerCase().includes(trimmedQuery)
      )
    : popularActivities.slice(0, 6);

  const guestTypes = [
    { key: "adults" as const, label: "Adults", description: "Aged 13 or above" },
    { key: "children" as const, label: "Children", description: "Ages 2 - 12" },
    { key: "infants" as const, label: "Infants", description: "Under 2" },
  ];

  return (
    <div
      ref={searchBarRef}
      className={cn(
        "relative flex flex-col gap-2 rounded-[28px] border border-[#c7c1ba] bg-white p-2 lg:flex-row lg:items-center lg:gap-[9px] lg:rounded-[57px] shadow-sm transition-all",
        variant === "nav" && "shadow-lg border-[#E0DFDD] bg-white",
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
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-5 py-2.5 text-left transition-colors cursor-pointer",
            activeTab === "where" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/60"
          )}
        >
          <label htmlFor={`search-where-${variant}`} className="text-xs font-semibold text-foreground cursor-pointer">
            Where
          </label>
          <input
            id={`search-where-${variant}`}
            ref={whereInputRef}
            type="text"
            value={selectedWhere}
            placeholder="Search destinations or activities"
            onFocus={() => setActiveTab("where")}
            onChange={(e) => {
              setSelectedWhere(e.target.value);
              setSelectedWhereId("");
              setSelectedType(null);
              if (activeTab !== "where") setActiveTab("where");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
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
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-5 py-2.5 text-left transition-colors cursor-pointer",
            activeTab === "when" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/60"
          )}
        >
          <label htmlFor={`search-when-${variant}`} className="text-xs font-semibold text-foreground cursor-pointer">
            When
          </label>
          <input
            id={`search-when-${variant}`}
            ref={whenInputRef}
            type="text"
            value={selectedWhen}
            placeholder="Add dates"
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
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-5 py-2.5 text-left transition-colors cursor-pointer",
            activeTab === "who" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/60"
          )}
        >
          <label htmlFor={`search-who-${variant}`} className="text-xs font-semibold text-foreground cursor-pointer">
            Who
          </label>
          <input
            id={`search-who-${variant}`}
            ref={whoInputRef}
            type="text"
            value={whoText}
            placeholder="Add guests"
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

      {/* Search Button */}
      {variant === "nav" ? (
        <button
          type="button"
          aria-label="Search"
          disabled={!allFieldsFilled}
          onClick={() => handleSearch()}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 text-white transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm w-full lg:w-auto"
        >
          <Search className="size-4 stroke-[2.5]" />
          <span className="font-sans text-sm font-semibold">Search</span>
        </button>
      ) : (
        <button
          type="button"
          aria-label="Search"
          disabled={!allFieldsFilled}
          onClick={() => handleSearch()}
          className="flex size-12 shrink-0 items-center justify-center self-end rounded-full bg-brand text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto cursor-pointer"
        >
          <Image src="/icons/search-lg.svg" alt="" width={20} height={20} className="invert" />
        </button>
      )}

      {/* Suggested Destinations & Activities Dropdown Modal */}
      {activeTab === "where" && (
        <div className="absolute top-[calc(100%+12px)] left-0 z-50 flex w-[440px] max-w-[calc(100vw-32px)] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.14)] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex w-full flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
            {filteredDestinations.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6B72]">
                  Destinations
                </span>
                {filteredDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => {
                      setSelectedWhere(dest.city);
                      setSelectedWhereId(dest.id);
                      setSelectedType("destination");
                      setActiveTab("when");
                    }}
                    className="flex w-full items-center gap-[14.5px] rounded-xl p-1.5 text-left transition-colors hover:bg-[#F4F2EE]/70 cursor-pointer"
                  >
                    <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#F4F2EE]">
                      <Image
                        src="/icons/pin-destination.svg"
                        alt=""
                        width={18}
                        height={22}
                        className="h-[22px] w-[18px]"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold leading-5 text-[#130404] truncate">
                        {dest.city}
                      </span>
                      <span className="text-xs leading-4 text-[#6F6B72] truncate">
                        {dest.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {filteredActivities.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-[#f0eee9] pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6B72]">
                  Activities &amp; Experiences
                </span>
                {filteredActivities.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      setSelectedWhere(act.label);
                      setSelectedWhereId(act.id);
                      setSelectedType("activity");
                      setActiveTab("when");
                    }}
                    className="flex w-full items-center gap-[14.5px] rounded-xl p-1.5 text-left transition-colors hover:bg-[#F4F2EE]/70 cursor-pointer"
                  >
                    <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#F4F2EE]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F5032D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold leading-5 text-[#130404] truncate">
                        {act.label}
                      </span>
                      <span className="text-xs leading-4 text-[#6F6B72] truncate">
                        {act.subtitle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {filteredDestinations.length === 0 && filteredActivities.length === 0 && (
              <p className="py-3 text-sm text-muted-foreground">
                No destinations or activities found matching &ldquo;{selectedWhere}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* Calendar Dropdown Modal */}
      {activeTab === "when" && (
        <div
          className={cn(
            "absolute top-[calc(100%+12px)] z-50 flex w-[440px] max-w-[calc(100vw-32px)] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.14)] animate-in fade-in zoom-in-95 duration-150",
            variant === "nav" ? "left-1/2 -translate-x-1/2" : "left-0 lg:left-[170px]"
          )}
        >
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
        <div
          className={cn(
            "absolute top-[calc(100%+12px)] right-0 z-50 flex w-[400px] max-w-[calc(100vw-32px)] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.14)] animate-in fade-in zoom-in-95 duration-150",
            variant === "hero" && "lg:right-4"
          )}
        >
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

export function MobileSearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const filteredDestinations = trimmed
    ? allDestinations.filter(
        (dest) =>
          dest.city.toLowerCase().includes(trimmed) ||
          dest.id.toLowerCase().includes(trimmed) ||
          dest.description.toLowerCase().includes(trimmed)
      )
    : allDestinations.slice(0, 4);

  const filteredActivities = trimmed
    ? popularActivities.filter(
        (act) =>
          act.label.toLowerCase().includes(trimmed) ||
          act.id.toLowerCase().includes(trimmed) ||
          act.subtitle.toLowerCase().includes(trimmed)
      )
    : popularActivities.slice(0, 5);

  function executeSearch(searchQuery: string) {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const matchedDest = allDestinations.find(
      (d) =>
        d.city.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        q.includes(d.id.toLowerCase())
    );

    const matchedAct = popularActivities.find(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        q.includes(a.id.toLowerCase()) ||
        a.subtitle?.toLowerCase().includes(q)
    );

    onClose();
    if (matchedDest && !matchedAct) {
      router.push(`/cities/${matchedDest.id}`);
      return;
    }
    if (matchedAct) {
      router.push(`/categories/${matchedAct.id}`);
      return;
    }
    if (matchedDest) {
      router.push(`/cities/${matchedDest.id}`);
      return;
    }
    if (categoriesBySlug.has(q)) {
      router.push(`/categories/${q}`);
      return;
    }
    const slugified = q.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    router.push(`/categories/${slugified}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white p-6 lg:hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#130404]">Search</h2>
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-full bg-[#F4F2EE] text-[#130404]"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-[#c7c1ba] bg-white px-4 py-3 shadow-xs">
        <Image src="/icons/search-lg.svg" alt="" width={18} height={18} />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              executeSearch(query);
            }
          }}
          placeholder="Search destinations or activities"
          className="w-full border-0 bg-transparent font-sans text-base text-[#130404] placeholder:text-muted-foreground outline-none"
        />
      </div>

      <div className="mt-6 flex-1 overflow-y-auto pr-1">
        {filteredDestinations.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6B72]">
              Destinations
            </span>
            {filteredDestinations.map((dest) => (
              <button
                key={dest.id}
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/cities/${dest.id}`);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-[#F4F2EE]/70"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F4F2EE]">
                  <Image src="/icons/pin-destination.svg" alt="" width={16} height={20} className="h-5 w-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-[#130404] truncate">{dest.city}</span>
                  <span className="text-xs text-[#6F6B72] truncate">{dest.description}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {filteredActivities.length > 0 && (
          <div className={cn("flex flex-col gap-2", filteredDestinations.length > 0 && "mt-4 border-t border-[#f0eee9] pt-3")}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6B72]">
              Activities &amp; Experiences
            </span>
            {filteredActivities.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/categories/${act.id}`);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-[#F4F2EE]/70"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F4F2EE]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F5032D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-[#130404] truncate">{act.label}</span>
                  <span className="text-xs text-[#6F6B72] truncate">{act.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {filteredDestinations.length === 0 && filteredActivities.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No destinations or activities found matching &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
