"use client";

import { EyeIcon } from "lucide-react";
import { useState } from "react";

import { EyeOffIcon } from "@/components/icons/auth-icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Figma "Input" with trailing "eye-off" icon. The eye-open state isn't in
// the Figma export (password fields default to hidden) — lucide's EyeIcon
// stands in for that transient toggle state only.
interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PasswordInput({
  placeholder,
  value,
  onChange,
  className,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        type={visible ? "text" : "password"}
        size="cta"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground"
      >
        {visible ? <EyeIcon className="size-5" /> : <EyeOffIcon className="size-5" />}
      </button>
    </div>
  );
}
