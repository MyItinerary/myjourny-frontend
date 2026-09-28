"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth/session-store";
import { apiErrorMessage } from "@/lib/api-error";

export interface WishlistCollectionOut {
  id: string;
  name: string;
  item_count: number;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistExperienceOut {
  id: string;
  experienceId: string;
  title: string;
  imageUrl: string | null;
  price: number;
  currency: string;
  duration: number | null;
  city: string | null;
  country: string | null;
  headline: string | null;
  rating: number | null;
}

export interface WishlistCheckOut {
  saved: boolean;
  collection_ids: string[];
}

export const WISHLISTS_KEY = ["wishlists"] as const;
export const WISHLIST_IDS_KEY = ["wishlists", "my-ids"] as const;

export function useWishlists() {
  const { user } = useSession();
  return useQuery({
    queryKey: WISHLISTS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<WishlistCollectionOut[]>("/wishlists/");
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useMyWishlistedIds() {
  const { user } = useSession();
  return useQuery({
    queryKey: WISHLIST_IDS_KEY,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{ experience_ids: string[] }>("/wishlists/my-ids");
        return new Set(data.experience_ids ?? []);
      } catch {
        // Fallback to empty set
        return new Set<string>();
      }
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useWishlistExperiences(collectionId: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["wishlist-experiences", collectionId],
    queryFn: async () => {
      const { data } = await apiClient.get<WishlistExperienceOut[]>(
        `/wishlists/${collectionId}/experiences`
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user && !!collectionId,
    staleTime: 60_000,
  });
}

export function useCheckWishlisted(experienceId: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["wishlisted-check", experienceId],
    queryFn: async () => {
      const { data } = await apiClient.get<WishlistCheckOut>(
        `/wishlists/check/${experienceId}`
      );
      return data;
    },
    enabled: !!user && !!experienceId,
    staleTime: 30_000,
  });
}

export function useCreateWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiClient.post<WishlistCollectionOut>("/wishlists/", { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLISTS_KEY });
      toast.success("Collection created");
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Couldn't create wishlist collection."));
    },
  });
}

export function useRenameWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await apiClient.patch<WishlistCollectionOut>(`/wishlists/${id}`, { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLISTS_KEY });
      toast.success("Collection renamed");
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Couldn't rename collection."));
    },
  });
}

export function useDeleteWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/wishlists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLISTS_KEY });
      queryClient.invalidateQueries({ queryKey: WISHLIST_IDS_KEY });
      toast.success("Collection deleted");
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Couldn't delete collection."));
    },
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectionId,
      experienceId,
    }: {
      collectionId: string;
      experienceId: string;
    }) => {
      const { data } = await apiClient.post<WishlistExperienceOut>(
        `/wishlists/${collectionId}/experiences`,
        { experienceId }
      );
      return data;
    },
    onSuccess: (_data, { collectionId, experienceId }) => {
      queryClient.invalidateQueries({ queryKey: WISHLISTS_KEY });
      queryClient.invalidateQueries({ queryKey: WISHLIST_IDS_KEY });
      queryClient.invalidateQueries({ queryKey: ["wishlisted-check", experienceId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-experiences", collectionId] });
      toast.success("Saved to collection");
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Couldn't save to collection."));
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectionId,
      experienceId,
    }: {
      collectionId: string;
      experienceId: string;
    }) => {
      await apiClient.delete(`/wishlists/${collectionId}/experiences/${experienceId}`);
    },
    onSuccess: (_data, { collectionId, experienceId }) => {
      queryClient.invalidateQueries({ queryKey: WISHLISTS_KEY });
      queryClient.invalidateQueries({ queryKey: WISHLIST_IDS_KEY });
      queryClient.invalidateQueries({ queryKey: ["wishlisted-check", experienceId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-experiences", collectionId] });
      toast.success("Removed from collection");
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Couldn't remove from collection."));
    },
  });
}

export function useRemoveExperienceFromAllWishlists() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experienceId: string) => {
      await apiClient.delete(`/wishlists/experiences/${experienceId}`);
    },
    onMutate: async (experienceId) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_IDS_KEY });
      const previous = queryClient.getQueryData<Set<string>>(WISHLIST_IDS_KEY);
      queryClient.setQueryData<Set<string>>(WISHLIST_IDS_KEY, (old) => {
        const next = new Set(old ?? []);
        next.delete(experienceId);
        return next;
      });
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_IDS_KEY, context.previous);
      }
      toast.error(apiErrorMessage(err, "Couldn't remove from wishlist."));
    },
    onSuccess: (_data, experienceId) => {
      queryClient.invalidateQueries({ queryKey: WISHLISTS_KEY });
      queryClient.invalidateQueries({ queryKey: WISHLIST_IDS_KEY });
      queryClient.invalidateQueries({ queryKey: ["wishlisted-check", experienceId] });
      toast.success("Removed from wishlists");
    },
  });
}
