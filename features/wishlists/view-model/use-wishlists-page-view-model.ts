import { useState } from "react";

import { useSession } from "@/lib/auth/session-store";
import { useCreateWishlist, useDeleteWishlist, useWishlists } from "@/lib/queries/wishlists";
import { formatUpdated } from "@/lib/wishlist-format";

import { useWishlistCoverLayouts } from "../model/wishlist-covers";
import type { WishlistCoverLayout } from "../model/wishlist-covers.types";

// The grid holds 8 tiles including the "New wishlist" tile; past that, the rest sit behind "Show more".
export const COLLAPSED_COLLECTIONS = 7;

export interface WishlistCard {
  id: string;
  name: string;
  href: string;
  subtitle: string;
  cover: WishlistCoverLayout;
}

export interface WishlistsPageViewModel {
  /** "error": the collections couldn't load (not the same as having none). */
  status: "signed-out" | "loading" | "error" | "empty" | "ready";
  /** Loads the collections again after an error. */
  onRetry: () => void;
  cards: WishlistCard[];
  hasMore: boolean;
  onShowMore: () => void;

  /** Edit mode: each card can be deleted, and cards stop being links. */
  editing: boolean;
  onToggleEdit: () => void;
  onRequestDelete: (id: string) => void;
  deleteDialog: { open: boolean; name: string; pending: boolean; onConfirm: () => void; onClose: () => void };

  createDialog: { open: boolean; pending: boolean; onOpen: () => void; onSubmit: (name: string) => void; onClose: () => void };
}

/** My wishlists: the collections, their covers, creating one, and deleting whole collections in edit mode. */
export function useWishlistsPageViewModel(): WishlistsPageViewModel {
  const { user, hydrated } = useSession();
  const { data, isLoading, isError, isFetching, refetch } = useWishlists();
  const collections = data ?? [];
  const { mutate: createCollection, isPending: isCreating } = useCreateWishlist();
  const { mutate: deleteCollection, isPending: isDeleting } = useDeleteWishlist();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const covers = useWishlistCoverLayouts(collections);

  // A failed load says so, rather than looking like no wishlists; a retry shows the skeleton again.
  const failed = isError && !data;
  const status =
    hydrated && !user
      ? "signed-out"
      : !hydrated || isLoading || (failed && isFetching)
        ? "loading"
        : failed
          ? "error"
          : collections.length === 0
            ? "empty"
            : "ready";
  const visible = showAll ? collections : collections.slice(0, COLLAPSED_COLLECTIONS);
  const toDelete = collections.find((c) => c.id === deleteId);

  return {
    status,
    onRetry: () => void refetch(),
    cards: visible.map((collection) => ({
      id: collection.id,
      name: collection.name,
      href: `/wishlists/${collection.id}`,
      subtitle: `${collection.item_count} saved · Updated ${formatUpdated(collection.updated_at)}`,
      cover: covers[collection.id],
    })),
    hasMore: !showAll && collections.length > COLLAPSED_COLLECTIONS,
    onShowMore: () => setShowAll(true),

    // With nothing left to edit, edit mode ends on its own (the empty state shows instead).
    editing: editing && collections.length > 0,
    onToggleEdit: () => setEditing((on) => !on),
    onRequestDelete: setDeleteId,
    deleteDialog: {
      open: !!toDelete,
      name: toDelete?.name ?? "",
      pending: isDeleting,
      onConfirm: () => {
        if (toDelete) deleteCollection(toDelete.id, { onSuccess: () => setDeleteId(null) });
      },
      onClose: () => setDeleteId(null),
    },

    createDialog: {
      open: isCreateOpen,
      pending: isCreating,
      onOpen: () => setIsCreateOpen(true),
      onSubmit: (name) => createCollection(name, { onSuccess: () => setIsCreateOpen(false) }),
      onClose: () => setIsCreateOpen(false),
    },
  };
}
