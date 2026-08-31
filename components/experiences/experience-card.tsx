import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { StarIcon } from "@/components/icons/shared-icons";

// Figma: "Experience card" component, node 2001:9145.
export interface ExperienceCardProps {
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  duration: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency?: string;
  className?: string;
  /** Links to /experiences/{id} when present — mock/placeholder cards can omit it. */
  id?: string;
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ExperienceCard({
  imageSrc,
  imageAlt,
  category,
  title,
  duration,
  rating,
  reviewCount,
  priceFrom,
  currency = "NGN",
  className,
  id,
}: ExperienceCardProps) {
  const content = (
    <>
      <div className="relative size-[143px] shrink-0 overflow-hidden rounded-[16px] bg-muted">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          unoptimized
          sizes="143px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#F5032D]">{category}</span>
          <h3 className="line-clamp-2 font-sans text-base font-semibold leading-tight text-[#130404]">{title}</h3>
          <div className="flex items-center gap-1.5 font-sans text-xs text-[#6F6B72]">
            <span>{duration}</span>
            <span aria-hidden className="size-1 rounded-full bg-[#6F6B72]/50" />
            <span className="inline-flex items-center gap-1">
              <StarIcon className="size-3.5 fill-[#F5032D] text-[#F5032D]" />
              <span className="font-medium text-[#130404]">
                {rating.toFixed(1)} <span className="font-normal text-[#6F6B72]">({reviewCount.toLocaleString()})</span>
              </span>
            </span>
          </div>
        </div>

        <p className="whitespace-nowrap pt-1">
          <span className="font-sans text-sm font-normal text-[#6F6B72]">from </span>
          <span className="font-sans text-base font-bold text-[#130404]">
            {formatPrice(priceFrom, currency)}
          </span>
        </p>
      </div>
    </>
  );

  const articleClassName = cn(
    "group flex h-[167px] w-full max-w-[438px] items-start gap-3 rounded-2xl bg-card p-[12px_16px] transition-all hover:bg-[#FAF9F7]",
    className
  );

  if (id) {
    return (
      <Link href={`/experiences/${id}`} className={articleClassName}>
        {content}
      </Link>
    );
  }

  return <article className={articleClassName}>{content}</article>;
}
