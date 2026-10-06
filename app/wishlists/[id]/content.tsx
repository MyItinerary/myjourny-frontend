"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import { HeartRoundedIcon, StarIcon } from "@/components/icons/shared-icons";
import {
  useWishlists,
  useWishlistExperiences,
  useRemoveFromWishlist,
  useDeleteWishlist,
  useRenameWishlist,
} from "@/lib/queries/wishlists";
import { formatUpdated } from "@/lib/wishlist-format";
import { NameWishlistDialog, DeleteWishlistDialog } from "@/components/wishlists/wishlist-dialogs";

const FALLBACK_IMAGE = "/images/home/experiences/kayaking.jpg";
const PAGE_SIZE = 8;

export function WishlistDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data: collections = [] } = useWishlists();
  const currentCollection = collections.find((c) => c.id === id);

  const { data: experiences = [], isLoading } = useWishlistExperiences(id);
  const { mutate: removeFromCollection } = useRemoveFromWishlist();
  const { mutate: deleteCollection, isPending: isDeleting } = useDeleteWishlist();
  const { mutate: renameCollection, isPending: isRenaming } = useRenameWishlist();

  const collectionName = currentCollection?.name ?? "Collection";
  const count = currentCollection?.item_count ?? experiences.length;
  const visible = showAll ? experiences : experiences.slice(0, PAGE_SIZE);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[rgba(244,242,238,0.87)] to-white">
          <div className="mx-auto w-full max-w-[1352px] px-6 pb-6 pt-6 sm:px-10 sm:pt-10 lg:px-20">
            <nav className="text-sm text-[#212121]" aria-label="Breadcrumb">
              <Link href="/wishlists" className="text-[#F5032D] hover:underline">
                Wishlists
              </Link>
              <span className="mx-2">/</span>
              <span>{collectionName}</span>
            </nav>
            <h1 className="mt-3 font-heading text-[32px] font-extrabold leading-[1.2] text-[#2C0101] sm:text-[52px]">
              {collectionName}
            </h1>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base text-[#6F6B72] sm:text-2xl">
                {count} {count === 1 ? "experience" : "experiences"} saved
                {currentCollection ? ` · Updated ${formatUpdated(currentCollection.updated_at)}` : ""}
              </p>
              <div className="flex items-center gap-6 text-sm font-medium text-[#212121]">
                <button
                  type="button"
                  onClick={() => setIsRenameOpen(true)}
                  className="flex cursor-pointer items-center gap-2 hover:text-[#F5032D]"
                >
                  <Pencil className="size-5" />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex cursor-pointer items-center gap-2 hover:text-[#F5032D]"
                >
                  <Trash2 className="size-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1352px] px-6 pb-16 pt-6 sm:px-10 sm:pt-8 lg:px-20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <p className="mt-3 text-sm">Loading saved experiences...</p>
            </div>
          ) : experiences.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
              <h2 className="font-heading text-2xl font-bold text-[#130404]">This wishlist is empty</h2>
              <p className="max-w-sm text-base text-[#6F6B72]">
                Tap the heart on any experience to save it to {collectionName}.
              </p>
              <Link
                href="/"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-[#F5032D] px-4 py-3 text-base font-medium text-white transition-colors hover:bg-[#d90227]"
              >
                Browse experiences
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {visible.map((exp) => (
                  <article key={exp.id} className="group relative flex flex-col gap-3">
                    <Link
                      href={`/experiences/${exp.experienceId}`}
                      aria-label={exp.title}
                      className="absolute inset-0 z-0"
                    />
                    <div className="relative aspect-[262/174] w-full overflow-hidden rounded-2xl bg-muted">
                      <Image
                        src={exp.imageUrl || FALLBACK_IMAGE}
                        alt={exp.title}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 262px, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        aria-label="Remove from wishlist"
                        onClick={() =>
                          removeFromCollection({ collectionId: id, experienceId: exp.experienceId })
                        }
                        className="absolute right-3 top-3 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm"
                      >
                        <HeartRoundedIcon className="size-5 fill-[#F5032D] text-[#F5032D]" />
                      </button>
                    </div>
                    <div className="pointer-events-none flex flex-col gap-1">
                      {exp.city && (
                        <span className="text-xs font-medium uppercase text-[#F5032D]">{exp.city}</span>
                      )}
                      <h3 className="line-clamp-2 text-base font-medium text-[#212121]">{exp.title}</h3>
                      {exp.rating != null && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-[#6F6B72]">
                          <StarIcon className="size-4 fill-[#F5032D] text-[#F5032D]" />
                          {exp.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {experiences.length > PAGE_SIZE && !showAll && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="w-full cursor-pointer rounded-full bg-[#F5032D] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#d90227] sm:w-auto"
                  >
                    Show more
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <NameWishlistDialog
          open={isRenameOpen}
          title="Rename wishlist"
          initialName={collectionName}
          submitLabel="Save"
          pending={isRenaming}
          onClose={() => setIsRenameOpen(false)}
          onSubmit={(name) =>
            renameCollection({ id, name }, { onSuccess: () => setIsRenameOpen(false) })
          }
        />

        <DeleteWishlistDialog
          open={isDeleteOpen}
          name={collectionName}
          pending={isDeleting}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() =>
            deleteCollection(id, { onSuccess: () => router.replace("/wishlists") })
          }
        />
      </main>

      <Footer />
    </div>
  );
}
