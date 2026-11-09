"use client";

import { useState } from "react";

import { useInterestCategories, useSubcategories } from "../model/footer-categories";
import {
  FOOTER_LEGAL_LINKS,
  FOOTER_LINK_COLUMNS,
  FOOTER_SOCIAL_LINKS,
} from "../model/footer-content";
import type {
  FooterLinkColumn,
  FooterLink,
  FooterSocialLink,
  FooterSubcategory,
  FooterTab,
} from "../model/footer-content.types";

export type FooterViewModel = {
  tabs: FooterTab[];
  isLoadingTabs: boolean;
  onSelectTab: (id: number) => void;
  subcategories: FooterSubcategory[];
  isLoadingSubcategories: boolean;
  columns: FooterLinkColumn[];
  legalLinks: FooterLink[];
  socialLinks: FooterSocialLink[];
  year: number;
};

export function useFooterViewModel(): FooterViewModel {
  const categoriesQuery = useInterestCategories();
  const parents = (categoriesQuery.data ?? []).filter((c) => c.parent_id === null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const current = parents.find((c) => c.id === selectedId) ?? parents[0];

  const subcategoriesQuery = useSubcategories(current?.id ?? null);
  const subcategories = subcategoriesQuery.data ?? [];

  return {
    tabs: parents.map((c) => ({ id: c.id, label: c.text, active: c.id === current?.id })),
    isLoadingTabs: categoriesQuery.isLoading,
    onSelectTab: setSelectedId,
    subcategories: subcategories.map((s) => ({ id: s.id, label: s.text, href: `/categories/${s.slug}` })),
    isLoadingSubcategories:
      categoriesQuery.isLoading ||
      subcategoriesQuery.isLoading ||
      (subcategoriesQuery.isFetching && subcategories.length === 0),
    columns: FOOTER_LINK_COLUMNS,
    legalLinks: FOOTER_LEGAL_LINKS,
    socialLinks: FOOTER_SOCIAL_LINKS,
    year: new Date().getFullYear(),
  };
}
