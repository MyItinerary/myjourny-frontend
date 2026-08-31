import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors ExperienceCard's exact box layout so there's no layout shift
// once real data replaces it.
export function ExperienceCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-[167px] w-full max-w-[438px] items-start gap-3 rounded-2xl bg-card p-[12px_16px]", className)}>
      <Skeleton className="size-[143px] shrink-0 rounded-[16px]" />

      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}
