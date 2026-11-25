import { Skeleton } from "@/components/ui/skeleton";

export function ReceiptSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="rounded-[28px] border border-[#EBEBEB] bg-white p-6 shadow-xs sm:p-8 lg:col-span-7">
          <div className="flex flex-col items-center">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="mt-4 h-12 w-44 rounded-xl" />
            <Skeleton className="mt-2 h-4 w-60 rounded-md" />
          </div>
          <hr className="my-6 border-[#EBEBEB] sm:my-8" />
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 shrink-0 rounded-2xl sm:size-20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          </div>
          <hr className="my-5 border-[#EBEBEB]" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="mt-4 h-5 w-2/3 rounded-md" />
          <div className="mt-8 border-t border-[#EBEBEB] pt-6">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="mt-2 h-8 w-36 rounded-md" />
          </div>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <Skeleton className="h-12 w-full rounded-full sm:h-13" />
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6">
            <Skeleton className="h-6 w-32 rounded-md" />
            <div className="mt-4 space-y-4">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
