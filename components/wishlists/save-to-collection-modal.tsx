"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  useWishlists,
  useCheckWishlisted,
  useAddToWishlist,
  useRemoveFromWishlist,
  useCreateWishlist,
} from "@/lib/queries/wishlists";
import { useSession } from "@/lib/auth/session-store";
import { cn } from "@/lib/utils";
import { WishlistCover } from "@/components/wishlists/wishlist-cover";
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
export function SaveToCollectionModal({ experienceId, isOpen, onClose }: SaveToCollectionModalProps) {
  const router = useRouter();
  const { user } = useSession();
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const { data: collections = [], isLoading: isLoadingCollections } = useWishlists();
  const { data: checkData } = useCheckWishlisted(experienceId);
  const { mutate: addToCollection, isPending: isAdding } = useAddToWishlist();
  const { mutate: removeFromCollection, isPending: isRemoving } = useRemoveFromWishlist();
  const { mutate: createCollection, isPending: isCreating } = useCreateWishlist();

  if (!isOpen) return null;

  const close = () => {
    setIsCreatingNew(false);
    onClose();
  };

  if (!user) {
    return (
      <WishlistDialogShell title="Save to wishlist" onClose={close} className="max-w-[462px]">
        <p className="text-center text-base text-[#6F6B72]">
          Log in or create an account to save experiences to your wishlists.
        </p>
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            className="flex-1 cursor-pointer rounded-full border border-[#40000B] px-4 py-3 text-base font-medium text-[#40000B] hover:bg-[#40000B]/5"
            onClick={() => {
              close();
              router.push("/onboarding");
            }}
          >
            Sign up
          </button>
          <button
            type="button"
            className="flex-1 cursor-pointer rounded-full bg-[#F5032D] px-4 py-3 text-base font-medium text-white hover:bg-[#d90227]"
            onClick={() => {
              close();
              router.push("/login");
            }}
          >
            Log in
          </button>
        </div>
      </WishlistDialogShell>
    );
  }

  if (isLoadingCollections) {
    return (
      <WishlistDialogShell title="Save to wishlist" onClose={close} className="max-w-[462px]">
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
    <WishlistDialogShell title="Save to wishlist" onClose={close} className="max-w-[822px]">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-[30px] sm:grid-cols-2">
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
                    : addToCollection({ collectionId: collection.id, experienceId })
                }
                className="flex cursor-pointer flex-col gap-[18px] text-left disabled:cursor-wait"
              >
                <WishlistCover imageUrl={collection.cover_image_url} tone="dialog" selected={selected} />
                <div className="flex flex-col gap-[7px]">
                  <p className={cn("truncate text-xl font-semibold", selected ? "text-[#F5032D]" : "text-[#333134]")}>
                    {collection.name}
                  </p>
                  <p className="text-base leading-6 text-[#6F6B72]">
                    {selected ? "Saved · " : ""}
                    {collection.item_count} saved
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setIsCreatingNew(true)}
          className="w-full cursor-pointer rounded-full bg-[#F5032D] px-4 py-[18px] text-xl font-medium text-white transition-colors hover:bg-[#d90227] sm:text-2xl"
        >
          Create a new wishlist
        </button>
      </div>
    </WishlistDialogShell>
  );
}
