import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchContent } from "./content";

export const metadata: Metadata = {
  title: "Search Experiences | MyJourny",
  description: "Find unique travel experiences matched to your vibe and interests.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
