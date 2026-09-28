"use client";

import { Bell, Globe, Hand, Heart, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SettingsNavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { key: "personal", label: "Personal information", icon: User },
  { key: "security", label: "Login and security", icon: Shield },
  { key: "privacy", label: "Privacy", icon: Hand },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "taste", label: "Your preferences", icon: Heart },
  { key: "locale", label: "Language and currency", icon: Globe },
];

interface SettingsNavProps {
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export function SettingsNav({ active, onChange, className }: SettingsNavProps) {
  return (
    <nav
      aria-label="Account settings"
      className={cn(
        "box-border w-full shrink-0 border-b border-border bg-white px-4 py-4",
        "lg:w-[300px] lg:border-r lg:border-b-0 lg:py-10 lg:pr-6 lg:pl-10",
        className,
      )}
    >
      <div className="mb-3 font-sans text-lg leading-[1.2] font-extrabold text-foreground lg:mb-6 lg:ml-3 lg:text-2xl">
        Account settings
      </div>

      <div className="-mx-4 flex flex-row gap-0.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {SETTINGS_NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const selected = active === key;
          return (
            <button
              key={key}
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() => onChange(key)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-3 text-left whitespace-nowrap text-foreground transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                "hover:bg-[#F5F5F5] active:bg-[#EEEEEE]",
                "focus-visible:outline-none focus-visible:ring-[4px] focus-visible:ring-brand/16",
                selected ? "bg-muted" : "bg-transparent",
              )}
            >
              <Icon size={20} className="shrink-0 text-current" />
              <span
                className={cn(
                  "font-sans text-[15px] leading-[22px]",
                  selected ? "font-medium" : "font-normal",
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function SettingsNavSkeleton() {
  const widths = ["146px", "124px", "64px", "108px", "132px", "158px"];

  return (
    <div
      className={cn(
        "box-border w-full shrink-0 border-b border-border bg-white px-4 py-4",
        "lg:w-[300px] lg:border-r lg:border-b-0 lg:py-10 lg:pr-6 lg:pl-10",
      )}
    >
      <div className="mb-3 h-6 w-[130px] animate-pulse rounded-lg bg-[#F5F5F5] lg:mb-6 lg:ml-3 lg:h-[29px] lg:w-[170px]" />

      <div className="-mx-4 flex flex-row gap-0.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {widths.map((width, i) => (
          <div key={i} className="flex shrink-0 items-center gap-3.5 px-3.5 py-3">
            <div className="size-5 shrink-0 rounded-md bg-[#F5F5F5]" />
            <div className="h-3.5 animate-pulse rounded-full bg-[#F5F5F5]" style={{ width }} />
          </div>
        ))}
      </div>
    </div>
  );
}
