import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Figma "Bottom banner" (mobile only) — sticky Continue CTA.
interface OnboardingBottomBarProps {
  disabled?: boolean;
  onContinue: () => void;
  className?: string;
}

export function OnboardingBottomBar({
  disabled,
  onContinue,
  className,
}: OnboardingBottomBarProps) {
  return (
    <div className={cn("sticky bottom-0 bg-background px-4 pt-6 pb-8", className)}>
      <Button size="cta" disabled={disabled} onClick={onContinue} className="w-full">
        Continue
      </Button>
    </div>
  );
}
