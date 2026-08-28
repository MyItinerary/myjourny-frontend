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
      <div className="relative size-[113px] shrink-0 overflow-hidden rounded-[16.7px] bg-muted">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          unoptimized
          sizes="113px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[14px] leading-[21px] font-medium text-brand">{category}</span>
          <h3 className="line-clamp-2 text-[18px] leading-[27px] font-medium text-foreground">{title}</h3>
          <div className="flex items-center gap-1.5 text-sm leading-[22px] text-muted-foreground">
            <span>{duration}</span>
            <span aria-hidden className="size-1 rounded-full bg-muted-foreground/50" />
            <span className="inline-flex items-center gap-1.5">
              <StarIcon className="size-[18px] fill-brand text-brand" />
              <span>
                {rating.toFixed(1)} ({reviewCount.toLocaleString()})
              </span>
            </span>
          </div>
        </div>

        <p className="whitespace-nowrap">
          <span className="text-base leading-6 font-medium text-muted-foreground">from </span>
          <span className="text-xl leading-[30px] font-semibold text-foreground">
            {formatPrice(priceFrom, currency)}
          </span>
        </p>
      </div>
    </>
  );

  const articleClassName = cn("group flex items-start gap-3 bg-card px-4 py-3", className);

  if (id) {
    return (
      <Link href={`/experiences/${id}`} className={articleClassName}>
        {content}
      </Link>
    );
  }

  return <article className={articleClassName}>{content}</article>;
}
