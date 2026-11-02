import { cn } from "@/lib/utils";

import type { HostPreviewSwitchViewModel } from "../view-model/use-host-preview-switch-view-model";

// Development only: flips the whole portal between the design's sample host
// (filled) and a host with nothing yet (empty), so both can be reviewed from
// one link. Not part of the design.
export function HostPreviewSwitchView({ visible, mode, onChange }: HostPreviewSwitchViewModel) {
  if (!visible) return null;

  return (
    <div
      role="group"
      aria-label="Preview"
      className="fixed right-4 bottom-4 z-30 flex items-center gap-1 rounded-full bg-[#2C0101] p-1 text-xs font-medium text-white shadow-[0_8px_24px_rgba(16,24,40,0.24)]"
    >
      <span className="pr-1 pl-3 text-white/60">Preview</span>
      {(
        [
          ["full", "Filled"],
          ["empty", "Empty"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className={cn("h-7 cursor-pointer rounded-full px-3", mode === value ? "bg-white text-[#2C0101]" : "text-white hover:bg-white/[0.14]")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
