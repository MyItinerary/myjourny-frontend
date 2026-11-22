"use client";

import Link from "next/link";
import { Plus, X } from "lucide-react";

import { HomeNav } from "@/components/home/home-nav";
import { DeleteWishlistDialog, NameWishlistDialog } from "@/components/wishlists/wishlist-dialogs";
import { EmptyStateView } from "@/features/empty-state";
import { cn } from "@/lib/utils";

import type { WishlistCard, WishlistsPageViewModel } from "../view-model/use-wishlists-page-view-model";
import { WishlistCoverView } from "./wishlist-cover-view";

const WISHLIST_EMPTY_IMAGE = "/images/wishlists/empty-wishlist.png";
const CONTAINER = "mx-auto w-full max-w-[1352px] px-6 sm:px-10 lg:px-20";

/** My wishlists. The nav sits inside the hero's soft wash, as on Home, Experiences and Events. */
export function WishlistsPageView(vm: WishlistsPageViewModel) {
  const { status } = vm;
  return (
    <main className="flex-1">
      <section className="relative z-20 bg-gradient-to-b from-[rgba(244,242,238,0.87)] to-white">
        <HomeNav />
        {status === "ready" && (
          <div className={cn(CONTAINER, "flex items-start justify-between gap-4 pt-8 pb-10 sm:pt-16 sm:pb-16")}>
            {/* Title and subtitle styled like My experiences. */}
            <div className="flex max-w-[696px] flex-col gap-2">
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Saved for later</h1>
              <p className="text-base text-[#6F6B72]">Save what catches you, group it how you like, and book it when you&apos;re ready.</p>
            </div>
            <button
              type="button"
              aria-pressed={vm.editing}
              onClick={vm.onToggleEdit}
              className="h-11 shrink-0 cursor-pointer rounded-full bg-[#F4F2EE] px-5 text-base font-medium text-[#333134] transition-colors hover:bg-[#EAE7E2]"
            >
              {vm.editing ? "Done" : "Edit"}
            </button>
          </div>
        )}
      </section>

      {status === "signed-out" && (
        <EmptyStateView
          imageSrc={WISHLIST_EMPTY_IMAGE}
          title="Save what catches you"
          body="Tap the heart on anything you like. We’ll keep it here, and use it to shape what we show you next."
          ctaLabel="Get Started"
          href="/login"
        />
      )}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <p className="mt-3 text-sm">Loading your collections...</p>
        </div>
      )}
      {status === "empty" && (
        <EmptyStateView
          imageSrc={WISHLIST_EMPTY_IMAGE}
          title="It’s empty in here"
          body="When you start saving experiences to your wishlist they will show up here"
          ctaLabel="Browse experiences"
          href="/"
        />
      )}
      {status === "ready" && (
        <div className={cn(CONTAINER, "pt-6 pb-16 sm:pt-10")}>
          <div className="grid grid-cols-1 gap-x-[29px] gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
            {vm.cards.map((card) => (
              <CollectionCard key={card.id} card={card} editing={vm.editing} onDelete={() => vm.onRequestDelete(card.id)} />
            ))}

            {/* New wishlist; stepped aside while editing. */}
            {!vm.editing && (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={vm.createDialog.onOpen}
                  className="flex aspect-[21/20] w-full cursor-pointer items-center justify-center rounded-[20px] border border-dashed border-[#BDBDBD] transition-colors hover:bg-[#FAFAFA]"
                  aria-label="Create a new wishlist"
                >
                  <Plus className="size-[60px] text-[#F5032D]" strokeWidth={1} />
                </button>
                <div className="flex flex-col gap-0.5">
                  <p className="text-lg font-medium text-[#333134]">New wishlist</p>
                  <p className="text-base text-[#6F6B72]">Start a new collection</p>
                </div>
              </div>
            )}
          </div>

          {vm.hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={vm.onShowMore}
                className="w-full cursor-pointer rounded-full bg-[#F5032D] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#d90227] sm:w-auto"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      )}

      <NameWishlistDialog
        open={vm.createDialog.open}
        title="Create wishlist"
        submitLabel="Create"
        pending={vm.createDialog.pending}
        onClose={vm.createDialog.onClose}
        onSubmit={vm.createDialog.onSubmit}
      />
      <DeleteWishlistDialog {...vm.deleteDialog} />
    </main>
  );
}

function CollectionCard({ card, editing, onDelete }: { card: WishlistCard; editing: boolean; onDelete: () => void }) {
  const body = (
    <>
      <WishlistCoverView cover={card.cover} />
      <div className="flex flex-col gap-0.5">
        <h3 className="truncate text-lg font-medium text-[#333134]">{card.name}</h3>
        <p className="text-base text-[#6F6B72]">{card.subtitle}</p>
      </div>
    </>
  );
  // While editing, a card isn't a link: its × deletes the whole collection.
  if (editing) {
    return (
      <div className="relative flex flex-col gap-3">
        {body}
        <button
          type="button"
          aria-label={`Delete ${card.name}`}
          onClick={onDelete}
          className="absolute top-3 left-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#333134] shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-transform hover:scale-105"
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    );
  }
  return (
    <Link href={card.href} className="flex flex-col gap-3">
      {body}
    </Link>
  );
}
