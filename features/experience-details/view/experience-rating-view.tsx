import { StarIcon } from "@/components/icons/shared-icons";

/** The experience's rating. There are no written reviews to show yet. */
export function ExperienceRatingView({ rating }: { rating: string | null }) {
  return (
    <section className="flex items-center gap-3">
      <StarIcon className="size-8 fill-brand text-brand lg:size-10" />
      {rating ? (
        <h2 className="font-sans text-2xl font-semibold text-[#333134] lg:text-[32px]">{rating}</h2>
      ) : (
        <h2 className="font-sans text-xl font-semibold text-[#333134]">No reviews yet</h2>
      )}
    </section>
  );
}
