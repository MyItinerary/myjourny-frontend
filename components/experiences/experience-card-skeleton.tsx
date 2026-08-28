import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors ExperienceCard's exact box layout so there's no layout shift
// once real data replaces it.
export function ExperienceCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 bg-card px-4 py-3", className)}>
      <Skeleton className="size-[113px] shrink-0 rounded-[16.7px]" />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-[21px] w-20" />
          <Skeleton className="h-[27px] w-full" />
          <Skeleton className="h-[22px] w-32" />
        </div>
        <Skeleton className="h-[30px] w-24" />
      </div>
    </div>
  );
}
