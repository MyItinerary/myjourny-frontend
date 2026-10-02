"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth/session-store";

export type Category = {
  id: number;
  parent_id: number | null;
  slug: string;
  text: string;
  weight?: number;
  category_type: string;
  is_active: boolean;
  children?: Category[];
  created_at?: string;
  updated_at?: string;
  admin_id?: string | null;
};

export function useCategories(categoryType: string, fallback: Category[]) {
  return useQuery({
    queryKey: ["categories", categoryType],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>("/categories", {
        params: { category_type: categoryType },
      });
      return data;
    },
    initialData: fallback,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });
}

// GET /categories?category_type=interest — fetches top-level interest categories
export function useInterestCategories(options?: { tree?: boolean }) {
  const tree = options?.tree;
  return useQuery({
    queryKey: ["categories", "interest", { tree }],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>("/categories", {
        params: {
          category_type: "interest",
          ...(tree !== undefined ? { tree, include_children: tree } : {}),
        },
      });
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

// GET /categories?parent_id=<parentId> — fetches subcategories for a specific parent category ID
export function useSubcategories(parentId: number | null | undefined) {
  return useQuery({
    queryKey: ["categories", "subcategories", parentId],
    queryFn: async () => {
      if (!parentId) return [];
      const { data } = await apiClient.get<Category[]>("/categories", {
        params: { parent_id: parentId },
      });
      return data;
    },
    enabled: typeof parentId === "number" && parentId > 0,
  });
}

// Recursively or deeply searches a category tree or flat list for a category by slug or id
export function findCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  for (const cat of categories) {
    if (cat.slug === slug || String(cat.id) === slug) return cat;
    if (cat.children && cat.children.length > 0) {
      for (const child of cat.children) {
        if (child.slug === slug || String(child.id) === slug) return child;
      }
    }
  }
  return undefined;
}

// Groups categories into parent-slug -> children Map, supporting both nested
// category.children trees (from tree=true) and flat parent_id associations.
export function groupChildrenByParentSlug(categories: Category[]): Map<string, Category[]> {
  const slugById = new Map<number, string>();
  for (const category of categories) {
    if (category.parent_id === null) slugById.set(category.id, category.slug);
  }

  const grouped = new Map<string, Category[]>();
  for (const category of categories) {
    if (category.children && category.children.length > 0) {
      grouped.set(category.slug, category.children);
    }
    if (category.parent_id === null) continue;
    const parentSlug = slugById.get(category.parent_id);
    if (!parentSlug) continue;
    const existing = grouped.get(parentSlug) ?? [];
    if (!existing.some((c) => c.id === category.id)) {
      existing.push(category);
    }
    grouped.set(parentSlug, existing);
  }
  return grouped;
}
