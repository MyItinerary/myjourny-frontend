import Image from "next/image";

import { cn } from "@/lib/utils";

// Stacked-photo cover from the wishlist designs: three tilted thumbnails
// peeking out of a panel. The API only gives one cover image per
// collection, so all three show it (the design repeats one placeholder).
const THUMBS = [
  { left: "11.1%", top: 28.6, h: 120, rotate: "-rotate-[14deg]", shadow: "shadow-[50px_0_40px_0_rgba(244,242,238,0.9)]" },
  { left: "58.6%", top: 7.8, h: 120, rotate: "rotate-[10deg]", shadow: "shadow-[4px_0_40px_0_rgba(244,242,238,0.9)]" },
  { left: "34.2%", top: 34.4, h: 116.5, rotate: "-rotate-2", shadow: "" },
];

export function WishlistCover({
  imageUrl,
  tone = "page",
  selected = false,
  className,
}: {
  imageUrl: string | null;
  tone?: "page" | "dialog";
  selected?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative h-[235px] w-full", className)}>
      {THUMBS.map((t, i) => (
        <div
          key={i}
          style={{ left: t.left, top: t.top, height: t.h }}
          className={cn(
            "absolute w-[100px] overflow-hidden rounded-[16px] border-2 border-[#F4F2EE] bg-[#E0DFDD]",
            t.rotate,
            t.shadow
          )}
        >
          {imageUrl && <Image src={imageUrl} alt="" fill sizes="100px" className="object-cover" />}
        </div>
      ))}
      <div
        className={cn(
          "absolute inset-x-0 top-[85px] h-[150px] rounded-[16px] border shadow-[20px_20px_70px_0_rgba(244,242,238,0.9)] transition-colors",
          tone === "page" ? "border-[#E0DFDD] bg-[#F4F2EE]" : "border-[#F4F2EE] bg-white",
          selected && "border-2 border-[#F5032D]"
        )}
      />
    </div>
  );
}
