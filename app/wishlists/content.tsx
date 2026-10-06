"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import { useWishlists, useCreateWishlist } from "@/lib/queries/wishlists";
import { useSession } from "@/lib/auth/session-store";
import { formatUpdated } from "@/lib/wishlist-format";
import { WishlistCover } from "@/components/wishlists/wishlist-cover";
import { NameWishlistDialog } from "@/components/wishlists/wishlist-dialogs";

// The grid holds 8 tiles including the "New wishlist" tile; past that,
// the rest sit behind "Show more".
const COLLAPSED_COLLECTIONS = 7;

function EmptyState({
  title,
  body,
  cta,
  href,
  compact = false,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
  compact?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-6 py-10 text-center sm:gap-[45px] sm:px-0 sm:py-20">
      <div className="relative size-[90px] overflow-hidden rounded-[4px] border-[0.5px] border-[#E0DFDD] sm:size-[180px] sm:rounded-[8px] sm:border">
        <Image src="/images/wishlists/empty-wishlist.png" alt="" fill sizes="180px" className="object-cover" />
      </div>
      <div className="flex w-full max-w-[696px] flex-col gap-5">
        <h2
          className={`font-heading text-[32px] font-extrabold leading-[1.2] text-[#130404] ${compact ? "sm:text-[44px]" : "sm:text-[52px]"}`}
        >
          {title}
        </h2>
        <p className="text-base leading-6 text-[#6F6B72] sm:text-2xl sm:leading-normal">{body}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-full bg-[#F5032D] px-4 py-3 text-base font-medium text-white transition-colors hover:bg-[#d90227]"
      >
        {cta}
      </Link>
    </div>
  );
}

export function WishlistsContent() {
  const { user } = useSession();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data: collections = [], isLoading } = useWishlists();
  const { mutate: createCollection, isPending: isCreating } = useCreateWishlist();

  const hasMore = collections.length > COLLAPSED_COLLECTIONS;
  const visible = showAll ? collections : collections.slice(0, COLLAPSED_COLLECTIONS);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeNav />

      <main className="flex-1">
        {!user ? (
          <EmptyState
            title="Save what catches you"
            body="Tap the heart on anything you like. We’ll keep it here, and use it to shape what we show you next."
            cta="Get Started"
            href="/login"
            compact
          />
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="mt-3 text-sm">Loading your collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <EmptyState
            title="It’s empty in here"
            body="When you start saving experiences to your wishlist they will show up here"
            cta="Browse experiences"
            href="/"
          />
        ) : (
          <>
            {/* Hero */}
            <section className="bg-gradient-to-b from-[rgba(244,242,238,0.87)] to-white">
              <div className="mx-auto w-full max-w-[1352px] px-6 pb-10 pt-8 sm:px-10 sm:pb-16 sm:pt-16 lg:px-20">
                <div className="flex max-w-[696px] flex-col gap-4 sm:gap-5">
                  <h1 className="font-heading text-[32px] font-extrabold leading-[1.2] text-[#2C0101] sm:text-[52px] sm:text-[#130404]">
                    Saved for later
                  </h1>
                  <p className="text-lg leading-7 text-[#6F6B72] sm:text-2xl sm:leading-normal">
                    Save what catches you, group it how you like, and book it when you&apos;re ready.
                  </p>
                </div>
              </div>
            </section>

            {/* Collections grid */}
            <div className="mx-auto w-full max-w-[1352px] px-6 pb-16 pt-6 sm:px-10 sm:pt-10 lg:px-20">
              <div className="grid grid-cols-1 gap-x-[29px] gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
                {visible.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/wishlists/${collection.id}`}
                    className="flex flex-col gap-[18px]"
                  >
                    <WishlistCover imageUrl={collection.cover_image_url} />
                    <div className="flex flex-col gap-[7px]">
                      <h3 className="truncate text-xl font-semibold text-[#333134]">{collection.name}</h3>
                      <p className="text-base leading-6 text-[#6F6B72]">
                        {collection.item_count} saved · Updated {formatUpdated(collection.updated_at)}
                      </p>
                    </div>
                  </Link>
                ))}

                {/* New wishlist */}
                <div className="flex flex-col gap-[18px]">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="flex h-[235px] w-full cursor-pointer items-center justify-center rounded-[16px] border border-dashed border-[#BDBDBD] transition-colors hover:bg-[#FAFAFA]"
                    aria-label="Create a new wishlist"
                  >
                    <Plus className="size-[60px] text-[#F5032D]" strokeWidth={1} />
                  </button>
                  <div className="flex flex-col gap-[7px]">
                    <p className="text-xl font-semibold text-[#333134]">New wishlist</p>
                    <p className="text-base leading-6 text-[#6F6B72]">Start a new collection</p>
                  </div>
                </div>
              </div>

              {hasMore && !showAll && (
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
            </div>
          </>
        )}

        <NameWishlistDialog
          open={isCreateOpen}
          title="Create wishlist"
          submitLabel="Create"
          pending={isCreating}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(name) => createCollection(name, { onSuccess: () => setIsCreateOpen(false) })}
        />
      </main>

      <Footer />
    </div>
  );
}
