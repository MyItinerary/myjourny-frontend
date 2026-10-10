"use client";

import { Fragment, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, Sparkles, MapPin, SlidersHorizontal } from "lucide-react";
import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import { ExperienceCardVertical } from "@/components/experiences/experience-card-vertical";
import {
  useSemanticSearch,
  formatDuration,
  type SemanticSearchResult,
} from "@/lib/queries/experiences";
import { Button } from "@/components/ui/button";
import { TasteQuizCtaView, useTasteQuizCtaViewModel } from "@/features/taste-quiz-cta";

// The taste-quiz banner sits after the second row of the 3-col grid.
const TASTE_QUIZ_CTA_AFTER = 6;
const FALLBACK_IMAGE = "/images/home/experiences/kayaking.jpg";

// 3-column grid: 15 = 5 full rows per page.
const PAGE_SIZE = 15;

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  // Keyed by query so any new search (this form or the nav) starts at one page.
  const tasteQuiz = useTasteQuizCtaViewModel();
  const [paging, setPaging] = useState({ query: initialQuery, count: PAGE_SIZE });
  const visibleCount = paging.query === initialQuery ? paging.count : PAGE_SIZE;

  const { data: results = [], isLoading } = useSemanticSearch({
    q: initialQuery,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Header Banner */}
        <div className="rounded-[28px] bg-radial from-[#FFF3F3] via-[#FAF6F3] to-[#F5F2ED] p-6 sm:p-10 border border-[#E0DFDD]/70 shadow-xs mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand mb-3">
              <Sparkles className="size-3.5" />
              <span>AI Semantic Search</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#2C0101] tracking-tight">
              {initialQuery ? (
                <>
                  Results for <span className="text-brand">&ldquo;{initialQuery}&rdquo;</span>
                </>
              ) : (
                "Search experiences"
              )}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#6F6B72]">
              Tell us what you feel like doing — in plain words — and we&apos;ll find matching experiences.
            </p>

            {/* Input Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#A09C96]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. quiet dinner with sunset view, adrenaline water sports..."
                  className="w-full h-12 rounded-full border border-[#E0DFDD] bg-white pl-11 pr-4 text-sm font-medium text-[#333134] placeholder:text-[#A09C96] focus:border-brand focus:outline-none shadow-xs"
                />
              </div>
              <Button
                type="submit"
                className="h-12 rounded-full bg-[#2C0101] px-6 text-sm font-semibold text-white hover:bg-black cursor-pointer shadow-xs"
              >
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E0DFDD] mb-6">
          <p className="text-sm font-semibold text-foreground">
            {isLoading ? (
              "Finding best matches..."
            ) : (
              <>
                Found <span className="text-brand font-bold">{results.length}</span>{" "}
                {results.length === 1 ? "experience" : "experiences"}
              </>
            )}
          </p>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="mt-3 text-sm">Searching experiences with AI matching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#F4F2EE] text-muted-foreground mb-4">
              <SearchIcon className="size-8 text-[#A09C96]" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              No matching experiences found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Try searching with different keywords, such as &ldquo;kayaking&rdquo;, &ldquo;island beach day&rdquo;, or &ldquo;cultural tour&rdquo;.
            </p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
            {results.slice(0, visibleCount).map((exp: SemanticSearchResult, index) => (
              <Fragment key={exp.experience_id}>
              <div className="relative group">
                <ExperienceCardVertical
                  id={exp.experience_id}
                  imageSrc={exp.imageUrl || FALLBACK_IMAGE}
                  imageAlt={exp.title}
                  category={exp.city || ""}
                  title={exp.title}
                  duration={formatDuration(exp.duration)}
                  rating={exp.rating ?? 0}
                  reviewCount={0}
                  priceFrom={Number(exp.price_from ?? exp.price ?? 0)}
                  currency={exp.currency ?? "NGN"}
                />

                {/* Match score badge (top-left over image) */}
                {exp.match_score != null && exp.match_score > 0 && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-xs pointer-events-none">
                    <Sparkles className="size-3 text-amber-300" />
                    <span>{Math.round(exp.match_score * 100)}% match</span>
                  </div>
                )}
              </div>
              {index === TASTE_QUIZ_CTA_AFTER - 1 && (
                <TasteQuizCtaView {...tasteQuiz} className="col-span-full" />
              )}
              </Fragment>
            ))}
          </div>
          {results.length > visibleCount && (
            <div className="mt-10 flex justify-center">
              <Button
                type="button"
                size="cta"
                onClick={() => setPaging({ query: initialQuery, count: visibleCount + PAGE_SIZE })}
                className="w-[134px]"
              >
                Show more
              </Button>
            </div>
          )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
