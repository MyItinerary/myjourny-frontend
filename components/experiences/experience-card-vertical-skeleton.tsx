import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors ExperienceCardVertical's exact box layout.
export function ExperienceCardVerticalSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <Skeleton className="aspect-[345/212] w-full rounded-2xl lg:aspect-auto lg:h-[212px]" />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-[21px] w-16" />
          <Skeleton className="h-[27px] w-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-[30px] w-28" />
      </div>
    </div>
  );
}
