"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Trash2, X, FolderHeart } from "lucide-react";
import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import { ExperienceCard } from "@/components/experiences/experience-card";
import {
  useWishlists,
  useWishlistExperiences,
  useRemoveFromWishlist,
  useDeleteWishlist,
  useRenameWishlist,
} from "@/lib/queries/wishlists";
import { formatDuration } from "@/lib/queries/experiences";
import { Button } from "@/components/ui/button";

const FALLBACK_IMAGE = "/images/home/experiences/kayaking.jpg";

export function WishlistDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameText, setRenameText] = useState("");

  const { data: collections = [] } = useWishlists();
  const currentCollection = collections.find((c) => c.id === id);

  const { data: experiences = [], isLoading } = useWishlistExperiences(id);
  const { mutate: removeFromCollection } = useRemoveFromWishlist();
  const { mutate: deleteCollection } = useDeleteWishlist();
  const { mutate: renameCollection, isPending: isRenaming } = useRenameWishlist();

  const collectionName = currentCollection?.name ?? "Collection";

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameText.trim()) return;
    renameCollection(
      { id, name: renameText.trim() },
      {
        onSuccess: () => {
          setIsRenameOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${collectionName}"?`)) {
      deleteCollection(id, {
        onSuccess: () => {
          router.replace("/wishlists");
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/wishlists"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>All Wishlists</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E0DFDD]">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              {collectionName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {experiences.length} {experiences.length === 1 ? "saved experience" : "saved experiences"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              onClick={() => {
                setRenameText(collectionName);
                setIsRenameOpen(true);
              }}
              className="rounded-full border-[#E0DFDD] flex items-center gap-1.5 h-10 px-4 text-xs font-semibold cursor-pointer"
            >
              <Edit3 className="size-3.5" />
              <span>Rename</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="rounded-full border-[#E0DFDD] text-destructive hover:bg-destructive/10 flex items-center gap-1.5 h-10 px-4 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Delete board</span>
            </Button>
          </div>
        </div>

        {/* Experiences Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="mt-3 text-sm">Loading saved experiences...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#F4F2EE] text-muted-foreground mb-4">
              <FolderHeart className="size-8 text-[#A09C96]" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              This collection is empty
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
              Browse experiences and tap the heart icon to save them to {collectionName}.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#2C0101] px-6 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              Explore experiences
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => (
              <div key={exp.id} className="group relative">
                <ExperienceCard
                  id={exp.experienceId}
                  imageSrc={exp.imageUrl || FALLBACK_IMAGE}
                  imageAlt={exp.title}
                  category={exp.city || ""}
                  title={exp.title}
                  duration={formatDuration(exp.duration)}
                  rating={exp.rating ?? 0}
                  reviewCount={0}
                  priceFrom={exp.price}
                  currency={exp.currency}
                />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() =>
                    removeFromCollection({
                      collectionId: id,
                      experienceId: exp.experienceId,
                    })
                  }
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm hover:bg-white hover:text-destructive transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Remove from collection"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Rename Modal */}
        {isRenameOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#E0DFDD]">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Rename Collection
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRenameOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE]"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleRenameSubmit} className="mt-4">
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Collection Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={renameText}
                  onChange={(e) => setRenameText(e.target.value)}
                  className="w-full h-11 rounded-full border border-[#E0DFDD] px-4 text-sm focus:border-brand focus:outline-none"
                />

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsRenameOpen(false)}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isRenaming || !renameText.trim()}
                    className="rounded-full bg-[#2C0101] text-white hover:bg-black px-6"
                  >
                    {isRenaming ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
