import type { ListSection } from "../model/experience-details.types";

/** Highlights, What to bring, Not suitable for and Know before you go, each a short list. */
export function ExperienceListsView({ sections }: { sections: ListSection[] }) {
  if (!sections.length) return null;
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {sections.map((section) => (
        <section key={section.kind} className={section.kind === "highlights" ? "lg:col-span-2" : undefined}>
          <h2 className="font-heading text-xl font-bold text-foreground">{section.title}</h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base text-muted-foreground marker:text-brand">
            {section.items.map((item, index) => (
              // Items are plain text and may repeat, so the position is part of the key.
               
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
