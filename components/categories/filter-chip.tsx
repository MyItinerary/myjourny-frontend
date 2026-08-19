import { ChevronDownIcon } from "@/components/icons/shared-icons";

// Figma "Chips" component (2001:11993 etc.) — visual-only filter pill, no
// working dropdown (no backend to filter against yet). Deliberately uses
// Neue Haas Grotesk Display Pro, not TikTok Sans — see DESIGN-SYSTEM.md's
// type-scale note; this is the one place in the app that font applies.
export function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      style={{ fontFamily: "'Neue Haas Grotesk Display Pro', var(--font-sans)" }}
      className="flex shrink-0 items-center gap-2 rounded-full bg-muted px-4 py-1 text-sm text-foreground"
    >
      {label}
      <ChevronDownIcon className="size-5" />
    </button>
  );
}
