"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderHeart, Plus, Trash2, Edit3, X } from "lucide-react";
import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import {
  useWishlists,
  useCreateWishlist,
  useDeleteWishlist,
  useRenameWishlist,
} from "@/lib/queries/wishlists";
import { useSession } from "@/lib/auth/session-store";
import { Button } from "@/components/ui/button";

export function WishlistsContent() {
  const router = useRouter();
  const { user } = useSession();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data: collections = [], isLoading } = useWishlists();
  const { mutate: createCollection, isPending: isCreating } = useCreateWishlist();
  const { mutate: deleteCollection } = useDeleteWishlist();
  const { mutate: renameCollection, isPending: isRenaming } = useRenameWishlist();

  if (!user && typeof window !== "undefined") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <HomeNav />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#F4F2EE] text-foreground mb-4">
              <FolderHeart className="size-8 text-[#6F6B72]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Save your favourite experiences
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in or create an account to organize experiences into custom wishlists and plan your journeys.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#2C0101] px-6 text-sm font-semibold text-white hover:bg-black transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#E0DFDD] px-6 text-sm font-semibold text-foreground hover:bg-[#F4F2EE] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    createCollection(newCollectionName.trim(), {
      onSuccess: () => {
        setNewCollectionName("");
        setIsCreateOpen(false);
      },
    });
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editingName.trim()) return;
    renameCollection(
      { id: editingId, name: editingName.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingName("");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E0DFDD]">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Wishlists
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize and save experiences you want to take on your next trip.
            </p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-full bg-[#2C0101] text-white hover:bg-black flex items-center gap-2 h-11 px-5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Create collection</span>
          </Button>
        </div>

        {/* Collections Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="mt-3 text-sm">Loading your collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#F4F2EE] text-muted-foreground mb-4">
              <FolderHeart className="size-8 text-[#A09C96]" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              No wishlists yet
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
              As you browse, tap the heart icon on any experience to save it to a collection.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 rounded-full bg-[#2C0101] text-white hover:bg-black"
            >
              Create your first collection
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="group relative flex flex-col rounded-[20px] border border-[#E0DFDD]/70 bg-white p-3 shadow-xs hover:shadow-md transition-all"
              >
                {/* Image Cover Box */}
                <div
                  onClick={() => router.push(`/wishlists/${collection.id}`)}
                  className="relative aspect-4/3 w-full rounded-[14px] bg-[#F4F2EE] overflow-hidden cursor-pointer"
                >
                  {collection.cover_image_url ? (
                    <Image
                      src={collection.cover_image_url}
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <FolderHeart className="size-10 text-[#C4C2BE]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mt-3 flex items-center justify-between">
                  <div
                    onClick={() => router.push(`/wishlists/${collection.id}`)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <h3 className="font-heading text-base font-bold text-foreground truncate group-hover:text-brand transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {collection.item_count}{" "}
                      {collection.item_count === 1 ? "saved" : "saved"}
                    </p>
                  </div>

                  {/* Actions Dropdown / Quick buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(collection.id);
                        setEditingName(collection.name);
                      }}
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE] hover:text-foreground transition-colors cursor-pointer"
                      title="Rename"
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete wishlist "${collection.name}"?`)) {
                          deleteCollection(collection.id);
                        }
                      }}
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE] hover:text-destructive transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Collection */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#E0DFDD]">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Create Wishlist
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE]"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="mt-4">
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Summer Vacation, Beach Trips"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full h-11 rounded-full border border-[#E0DFDD] px-4 text-sm focus:border-brand focus:outline-none"
                />

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || !newCollectionName.trim()}
                    className="rounded-full bg-[#2C0101] text-white hover:bg-black px-6"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Rename Collection */}
        {editingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#E0DFDD]">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Rename Wishlist
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#F4F2EE]"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleRename} className="mt-4">
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Collection Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full h-11 rounded-full border border-[#E0DFDD] px-4 text-sm focus:border-brand focus:outline-none"
                />

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isRenaming || !editingName.trim()}
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
