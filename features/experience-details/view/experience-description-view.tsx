import type { ExperienceDescription } from "../view-model/use-experience-details-view-model";

/** "About this experience", paragraph by paragraph; a long one starts cut short. */
export function ExperienceDescriptionView({ description }: { description: ExperienceDescription }) {
  const { paragraphs, long, expanded, onToggle } = description;
  // The view model has already cut a long description short.
  if (!paragraphs.length) return null;
  return (
    <section>
      <h2 className="font-heading text-2xl font-bold text-[#130404]">About this experience</h2>
      <div className="mt-3 flex flex-col gap-3">
        {paragraphs.map((paragraph, index) => (
          // Paragraphs have no identity beyond their position.
           
          <p key={index} className="font-sans text-base leading-[26px] text-[#6F6B72]">
            {paragraph}
          </p>
        ))}
      </div>
      {long && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-2 cursor-pointer font-medium text-[#F5032D] underline underline-offset-2 hover:opacity-85"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </section>
  );
}
