import { useMemo, useState } from "react";

import { LISTING_FILTER_GROUPS, toFilterParams } from "../model/listing-filters";
import type { ListingFilterGroupId, ListingFilterParams, ListingFilterState } from "../model/listing-filters.types";

export type ListingFilterChip = {
  id: ListingFilterGroupId;
  /** The group's name ("Price"), for its options panel. */
  name: string;
  /** The group's name, or the picked option once there is one. */
  label: string;
  active: boolean;
  open: boolean;
  options: { id: string; label: string; selected: boolean }[];
};

export type ListingFiltersViewModel = {
  chips: ListingFilterChip[];
  activeCount: number;
  /** Spread into the listing query. */
  params: ListingFilterParams;
  onToggle: (group: ListingFilterGroupId) => void;
  /** Pick an option, or pick the selected one again to clear the group. */
  onSelect: (group: ListingFilterGroupId, optionId: string) => void;
  onClose: () => void;
  onClearAll: () => void;
};

/** Price, duration and time-of-day filters for a listing page. */
export function useListingFiltersViewModel(): ListingFiltersViewModel {
  const [state, setState] = useState<ListingFilterState>({});
  const [openGroup, setOpenGroup] = useState<ListingFilterGroupId | null>(null);
  const params = useMemo(() => toFilterParams(state), [state]);

  const chips = LISTING_FILTER_GROUPS.map((group) => {
    const picked = group.options.find((o) => o.id === state[group.id]);
    return {
      id: group.id,
      name: group.label,
      label: picked?.label ?? group.label,
      active: !!picked,
      open: openGroup === group.id,
      options: group.options.map((o) => ({ id: o.id, label: o.label, selected: o.id === picked?.id })),
    };
  });

  return {
    chips,
    activeCount: chips.filter((c) => c.active).length,
    params,
    onToggle: (group) => setOpenGroup((current) => (current === group ? null : group)),
    onSelect: (group, optionId) => {
      setState((s) => ({ ...s, [group]: s[group] === optionId ? undefined : optionId }));
      setOpenGroup(null);
    },
    onClose: () => setOpenGroup(null),
    onClearAll: () => {
      setState({});
      setOpenGroup(null);
    },
  };
}
