"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Globe, MapPin, Star } from "lucide-react";
import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import { useUser } from "@/lib/queries/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GuideProfileContent({ id }: { id: string }) {
  const router = useRouter();
  const { data: guide, isLoading } = useUser(id);

  const displayName = guide?.name || guide?.full_name || "Guide";
  const avatarUrl = guide?.avatar || guide?.avatar_url;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeNav />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="mt-3 text-sm">Loading guide profile...</p>
          </div>
        ) : !guide ? (
          <div className="py-20 text-center">
            <h2 className="font-heading text-xl font-bold text-foreground">Guide not found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This guide profile does not exist or may have been removed.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#2C0101] px-6 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Guide Card Header */}
            <div className="rounded-[24px] border border-[#E0DFDD] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <Avatar className="size-24 sm:size-28 border-2 border-[#F4F2EE] shadow-xs">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-[#F4F2EE] font-sans text-2xl font-bold text-[#333134]">
                    {displayName[0]?.toUpperCase() ?? "G"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">
                      {displayName}
                    </h1>
                    {guide.is_verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#02A078]/10 px-2.5 py-0.5 text-xs font-semibold text-[#02A078]">
                        <CheckCircle2 className="size-3.5" />
                        <span>Verified Guide</span>
                      </span>
                    )}
                  </div>

                  {guide.headline && (
                    <p className="mt-1 text-base text-[#6F6B72] font-medium">
                      {guide.headline}
                    </p>
                  )}

                  {/* Badges / Stats */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-[#6F6B72]">
                    {guide.rating_avg != null && (
                      <div className="flex items-center gap-1 text-[#1E1E1E] font-semibold">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        <span>{guide.rating_avg.toFixed(1)} rating</span>
                      </div>
                    )}

                    {(guide.city || guide.country) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="size-4 text-[#8C888F]" />
                        <span>
                          {[guide.city, guide.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    {guide.languages && guide.languages.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Globe className="size-4 text-[#8C888F]" />
                        <span>Speaks {guide.languages.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio / About */}
              {(guide.about || guide.bio) && (
                <div className="mt-6 pt-6 border-t border-[#E0DFDD]/70">
                  <h3 className="font-heading text-base font-bold text-foreground mb-2">
                    About {displayName}
                  </h3>
                  <p className="text-sm text-[#6F6B72] leading-relaxed whitespace-pre-line">
                    {guide.about || guide.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
