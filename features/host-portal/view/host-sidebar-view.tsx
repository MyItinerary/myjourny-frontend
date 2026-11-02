import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostSidebarViewModel, HostStatus } from "../view-model/use-host-sidebar-view-model";
import { HOST_NAV_ICONS, type HostNavIconKey } from "./host-nav-icons";

const FOCUS_RING =
  "focus-visible:shadow-[inset_0_0_0_1.5px_#F5032D,0_0_0_4px_rgba(245,3,45,0.16)] focus-visible:outline-none";

const TONE: Record<HostStatus["tone"], { text: string; dot: string }> = {
  green: { text: "text-[#0CBA65]", dot: "bg-[#0CBA65]" },
  amber: { text: "text-[#B4760A]", dot: "bg-[#B4760A]" },
  red: { text: "text-[#F5032D]", dot: "bg-[#F5032D]" },
};

// 20px, drawn into a 24 x 24 box. Filled, never stroked, and coloured by the
// parent (currentColor). See host-nav-icons.ts.
function NavIcon({ name }: { name: HostNavIconKey }) {
  const { d, transform } = HOST_NAV_ICONS[name];
  return (
    <svg aria-hidden width={20} height={20} viewBox="0 0 24 24" className="shrink-0">
      <path d={d} fill="currentColor" fillRule="nonzero" transform={transform} />
    </svg>
  );
}

const STATUS_PATHS: Record<HostStatus["glyph"], string[]> = {
  seal: [
    "M12 2.5l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.6.9 2.6-2.1 1.7-.7 2.6-2.7.2-2 1.8-2.4-1.3-2.7.3-1.2-2.4L2.3 15l.4-2.7-.7-2.6 2.2-1.6.5-2.7 2.7-.4z",
    "M8.6 12.1l2.3 2.2 4.4-4.4",
  ],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7.5V12l3 2"],
  alert: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 8v4.5", "M12 16h.01"],
};

function StatusGlyph({ kind }: { kind: HostStatus["glyph"] }) {
  return (
    <svg
      aria-hidden
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {STATUS_PATHS[kind].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

// Figma / handoff "Sidebar Nav": the host portal's left rail. 240px, or 72px
// collapsed, with the seven destinations and the host card pinned to the bottom.
export function HostSidebarView({ open, onToggle, items, host }: HostSidebarViewModel) {
  const dotOnAvatar = !open && host.status?.dotOnAvatar ? TONE[host.status.tone].dot : null;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-dvh shrink-0 flex-col bg-[#FAF9F7] px-[14px] pt-[22px] pb-[14px] shadow-[inset_-1px_0_0_#E7E7E7] transition-[width] duration-200 ease-[cubic-bezier(.4,0,.2,1)]",
        open ? "w-[240px]" : "w-[72px]",
      )}
    >
      <div className="flex min-h-6 items-center gap-2 px-1.5 pb-[22px]">
        {open && (
          <>
            <Image src="/images/host-portal/mark-red.svg" alt="Myjourny" width={22} height={22} className="size-[22px] shrink-0" />
            <span className="font-heading text-base font-extrabold tracking-[-0.2px] text-[#333134]">myjourny</span>
          </>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Collapse the menu" : "Expand the menu"}
          aria-expanded={open}
          className={cn(
            "flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6F6B72] transition-colors duration-[120ms] hover:bg-[#EEEEEE]",
            FOCUS_RING,
            open ? "ml-auto" : "mx-auto",
          )}
        >
          <svg
            aria-hidden
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("transition-transform duration-200 ease-[cubic-bezier(.4,0,.2,1)]", !open && "rotate-180")}
          >
            <path d="M14.5 7L9.5 12l5 5" />
          </svg>
        </button>
      </div>

      <nav aria-label="Host portal" className="flex flex-col gap-0.5">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            aria-label={open ? undefined : item.label}
            className={cn(
              "group/item relative flex h-[38px] items-center gap-2.5 rounded-full text-[13.5px] transition-colors duration-[120ms] ease-[cubic-bezier(.4,0,.2,1)]",
              FOCUS_RING,
              open ? "w-full justify-start px-2.5" : "w-[44px] justify-center self-center px-0",
              item.active
                ? "bg-[#F4F2EE] font-medium text-[#333134] active:bg-[#EEECE7] active:font-normal"
                : "font-normal text-[#6F6B72] hover:bg-[#F4F2EE] active:bg-[#EEECE7] active:text-[#333134]",
            )}
          >
            <span className={cn("flex shrink-0", item.active ? "text-[#F5032D] group-active/item:text-[#6F6B72]" : "text-[#6F6B72]")}>
              <NavIcon name={item.icon} />
            </span>
            {open && <span className="whitespace-nowrap">{item.label}</span>}
            {open && item.badge && (
              <span
                className={cn(
                  "ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#F5032D] text-[11px] font-medium text-white",
                  item.badge.length > 2 && "px-1.5",
                )}
              >
                {item.badge}
              </span>
            )}
            {!open && item.badge && (
              <span
                aria-hidden
                className="absolute top-2 right-[9px] size-[9px] rounded-full bg-[#F5032D] shadow-[0_0_0_2px_#FAF9F7]"
              />
            )}
            {!open && (
              <span
                role="tooltip"
                className="pointer-events-none absolute top-1/2 left-[calc(100%+10px)] z-50 -translate-y-1/2 rounded-lg bg-[#2C0101] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover/item:opacity-100 group-hover/item:delay-[120ms] group-focus-visible/item:opacity-100 group-focus-visible/item:delay-[120ms]"
              >
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div
        className={cn(
          "mt-auto flex items-center gap-2.5 rounded-[14px] bg-white shadow-[inset_0_0_0_1px_#E7E7E7]",
          open ? "justify-start px-2.5 py-3" : "justify-center p-2",
        )}
      >
        <div className="relative size-9 shrink-0">
          {host.loading ? (
            <span className="block size-9 rounded-full bg-[#F4F4F4]" />
          ) : host.photoUrl ? (
            <Image src={host.photoUrl} alt="" width={36} height={36} unoptimized className="size-9 rounded-full object-cover" />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-[#F4F2EE] font-sans text-sm font-semibold text-[#333134]">
              {host.initials}
            </span>
          )}
          {dotOnAvatar && (
            <span aria-hidden className={cn("absolute -right-px -bottom-px size-[11px] rounded-full shadow-[0_0_0_2px_#fff]", dotOnAvatar)} />
          )}
        </div>
        {open && host.loading && (
          <div aria-hidden className="flex flex-col">
            <span className="h-[11px] w-24 animate-pulse rounded-full bg-[#EDEDED]" />
            <span className="mt-[7px] h-[9px] w-[68px] animate-pulse rounded-full bg-[#EDEDED]" />
          </div>
        )}
        {open && !host.loading && (
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[#333134]">{host.name}</p>
            {host.status && (
              <p className={cn("flex items-center gap-1 text-[11px] font-medium", TONE[host.status.tone].text)}>
                <StatusGlyph kind={host.status.glyph} />
                <span>{host.status.label}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
