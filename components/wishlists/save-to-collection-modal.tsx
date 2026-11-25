"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";

import {
  useWishlists,
  useCheckWishlisted,
  useAddToWishlist,
  useRemoveFromWishlist,
  useCreateWishlist,
} from "@/lib/queries/wishlists";
import { useSession } from "@/lib/auth/session-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWishlistCoverLayouts, WishlistCoverView } from "@/features/wishlists";
import { NameWishlistDialog, WishlistDialogShell } from "@/components/wishlists/wishlist-dialogs";

export interface SaveToCollectionModalProps {
  experienceId: string;
  experienceTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Heart-icon flow: no wishlists yet → straight to "Create wishlist";
// otherwise pick from existing lists or create a new one. Creating a
// wishlist from here also saves the experience into it.
export function SaveToCollectionModal(props: SaveToCollectionModalProps) {
  // Kept mounted while it closes, so the sheet can roll back down.
  return <AnimatePresence>{props.isOpen && <SaveToCollectionSheet key="save" {...props} />}</AnimatePresence>;
}

function SaveToCollectionSheet({ experienceId, onClose }: SaveToCollectionModalProps) {
  const router = useRouter();
  const { user } = useSession();
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const { data: collections = [], isLoading: isLoadingCollections } = useWishlists();
  const { data: checkData } = useCheckWishlisted(experienceId);
  const { mutate: addToCollection, isPending: isAdding } = useAddToWishlist();
  const { mutate: removeFromCollection, isPending: isRemoving } = useRemoveFromWishlist();
  const { mutate: createCollection, isPending: isCreating } = useCreateWishlist({ silent: true });
  // The same covers as My wishlists: one experience's image, or a 2×2 grid of up to four.
  const covers = useWishlistCoverLayouts(collections);

  const close = () => {
    setIsCreatingNew(false);
    onClose();
  };

  if (!user) {
    return (
      <WishlistDialogShell title="Save to wishlist" onClose={close} className="max-w-[440px] sm:p-6">
        <p className="text-center text-base text-[#6F6B72]">
          Log in or create an account to save experiences to your wishlists.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="cta"
            className="flex-1"
            onClick={() => {
              close();
              router.push("/onboarding");
            }}
          >
            Sign up
          </Button>
          <Button
            type="button"
            variant="brand"
            size="cta"
            className="flex-1"
            onClick={() => {
              close();
              router.push("/login");
            }}
          >
            Log in
          </Button>
        </div>
      </WishlistDialogShell>
    );
  }

  if (isLoadingCollections) {
    return (
      <WishlistDialogShell title="Save to wishlist" onClose={close} className="max-w-[440px] sm:p-6">
        <div className="flex justify-center py-10">
          <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </WishlistDialogShell>
    );
  }

  const hasCollections = collections.length > 0;

  if (!hasCollections || isCreatingNew) {
    return (
      <NameWishlistDialog
        open
        title="Create wishlist"
        submitLabel="Create"
        pending={isCreating}
        // Back to the picker when we came from it; otherwise dismiss.
        onClose={hasCollections ? () => setIsCreatingNew(false) : close}
        onSubmit={(name) =>
          createCollection(name, {
            onSuccess: (created) => {
              if (created?.id) addToCollection({ collectionId: created.id, experienceId });
              close();
            },
          })
        }
      />
    );
  }

  const activeIds = new Set(checkData?.collection_ids ?? []);

  return (
    // The same small card as the other wishlist dialogs. Past four collections the list scrolls
    // inside it, while the title and "Create a new wishlist" stay put.
    <WishlistDialogShell title="Save to wishlist" onClose={close} className="max-w-[440px] sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="-mx-1 max-h-[min(480px,55dvh)] overflow-y-auto px-1 pt-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 pb-1">
            {collections.map((collection) => {
              const selected = activeIds.has(collection.id);
              return (
                <button
                  key={collection.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={isAdding || isRemoving}
                  onClick={() =>
                    selected
                      ? removeFromCollection({ collectionId: collection.id, experienceId })
                      : // Saved: the dialog's job is done, so it closes.
                        addToCollection({ collectionId: collection.id, experienceId }, { onSuccess: close })
                  }
                  className="flex min-w-0 cursor-pointer flex-col gap-2 text-left disabled:cursor-wait"
                >
                  <WishlistCoverView
                    cover={covers[collection.id]}
                    className={cn("rounded-[16px]", selected && "ring-2 ring-[#F5032D] ring-offset-2")}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className={cn("truncate text-base font-medium", selected ? "text-[#F5032D]" : "text-[#333134]")}>
                      {collection.name}
                    </span>
                    <span className="text-sm text-[#6F6B72]">
                      {selected ? "Saved · " : ""}
                      {collection.item_count} saved
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <Button type="button" variant="brand" size="cta" onClick={() => setIsCreatingNew(true)} className="w-full">
          Create a new wishlist
        </Button>
      </div>
    </WishlistDialogShell>
  );
}
