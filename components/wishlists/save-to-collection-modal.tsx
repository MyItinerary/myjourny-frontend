"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, FolderPlus, Plus, X } from "lucide-react";
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

export interface SaveToCollectionModalProps {
  experienceId: string;
  experienceTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SaveToCollectionModal({
  experienceId,
  experienceTitle,
  isOpen,
  onClose,
}: SaveToCollectionModalProps) {
  const router = useRouter();
  const { user } = useSession();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const { data: collections = [], isLoading: isLoadingCollections } = useWishlists();
  const { data: checkData, isLoading: isLoadingCheck } = useCheckWishlisted(experienceId);
  const { mutate: addToCollection, isPending: isAdding } = useAddToWishlist();
  const { mutate: removeFromCollection, isPending: isRemoving } = useRemoveFromWishlist();
  const { mutate: createCollection, isPending: isCreating } = useCreateWishlist();

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
        <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0DFDD]">
            <h3 className="font-heading text-lg font-bold text-foreground">Save experience</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE]"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Please log in or create an account to save experiences to your wishlists.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-[#2C0101] text-white hover:bg-black rounded-full"
              onClick={() => {
                onClose();
                router.push("/login");
              }}
            >
              Log In
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-full border-[#E0DFDD]"
              onClick={() => {
                onClose();
                router.push("/onboarding");
              }}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeCollectionIds = new Set(checkData?.collection_ids ?? []);

  const handleToggleCollection = (collectionId: string) => {
    if (activeCollectionIds.has(collectionId)) {
      removeFromCollection({ collectionId, experienceId });
    } else {
      addToCollection({ collectionId, experienceId });
    }
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;

    createCollection(name, {
      onSuccess: (newCollection) => {
        setNewCollectionName("");
        setIsCreatingNew(false);
        if (newCollection?.id) {
          addToCollection({ collectionId: newCollection.id, experienceId });
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-[460px] rounded-[24px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E0DFDD]">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Save to Wishlist
            </h3>
            {experienceTitle && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {experienceTitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Collections List */}
        <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2 pr-1">
          {isLoadingCollections || isLoadingCheck ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <div className="mx-auto size-5 animate-spin rounded-full border-2 border-brand border-t-transparent mb-2" />
              Loading your collections...
            </div>
          ) : collections.length === 0 && !isCreatingNew ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#F4F2EE] text-muted-foreground mb-3">
                <FolderPlus className="size-6 text-[#A09C96]" />
              </div>
              <p className="text-sm font-semibold text-foreground">No wishlists yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first collection to organize your saved experiences.
              </p>
            </div>
          ) : (
            collections.map((collection) => {
              const isSavedInCollection = activeCollectionIds.has(collection.id);
              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => handleToggleCollection(collection.id)}
                  disabled={isAdding || isRemoving}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[16px] p-3 text-left transition-all cursor-pointer border",
                    isSavedInCollection
                      ? "border-[#2C0101] bg-[#FDF9F9]"
                      : "border-[#E0DFDD]/70 hover:border-[#E0DFDD] hover:bg-[#FAF9F7]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-12 rounded-[12px] bg-[#F4F2EE] overflow-hidden shrink-0">
                      {collection.cover_image_url ? (
                        <Image
                          src={collection.cover_image_url}
                          alt={collection.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground text-xs font-bold">
                          {collection.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {collection.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {collection.item_count}{" "}
                        {collection.item_count === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border transition-all shrink-0",
                      isSavedInCollection
                        ? "border-[#2C0101] bg-[#2C0101] text-white"
                        : "border-[#E0DFDD] bg-white text-transparent"
                    )}
                  >
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Create new collection form */}
        {isCreatingNew ? (
          <form onSubmit={handleCreateAndAdd} className="mt-4 pt-3 border-t border-[#E0DFDD]">
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Collection Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Summer Vacation, Lagos Trip"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="flex-1 h-10 rounded-full border border-[#E0DFDD] px-4 text-sm focus:border-brand focus:outline-none"
              />
              <Button
                type="submit"
                disabled={isCreating || !newCollectionName.trim()}
                className="h-10 rounded-full bg-[#2C0101] text-white hover:bg-black px-4 text-xs font-semibold"
              >
                Create
              </Button>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="h-10 px-3 rounded-full text-xs text-muted-foreground hover:bg-[#F4F2EE]"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 pt-3 border-t border-[#E0DFDD]">
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="flex w-full items-center gap-2 text-sm font-semibold text-[#2C0101] hover:text-brand transition-colors cursor-pointer py-1"
            >
              <Plus className="size-4" />
              <span>Create new collection</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6">
          <Button
            type="button"
            className="w-full rounded-full bg-[#2C0101] hover:bg-black text-white h-11"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
