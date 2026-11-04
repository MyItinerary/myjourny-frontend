import type { TermsParagraph } from "../model/terms.types";
import { FormattedText } from "./formatted-text";

export function TermsParagraphItem({ item }: { item: TermsParagraph }) {
  return (
    <div className="space-y-2">
      {item.subheading && (
        <h3 className="pt-2 font-sans text-sm font-bold text-[#130404]">
          {item.subheading}
        </h3>
      )}

      {(item.number || item.boldPrefix || item.text) && (
        <p className="font-sans text-base leading-relaxed text-[#333134]">
          {item.number && <span className="mr-2 font-normal">{item.number}</span>}
          {item.boldPrefix && (
            <strong className="mr-1.5 font-bold text-[#130404]">
              {item.boldPrefix}
            </strong>
          )}
          <span>
            <FormattedText text={item.text} />
          </span>
        </p>
      )}

      {item.bullets && item.bullets.length > 0 && (
        <>
          {item.isChecklist ? (
            <ul className="space-y-2.5">
              {item.bullets.map((subBullet, subIdx) => {
                const text = typeof subBullet === "string" ? subBullet : subBullet.text;
                const boldPrefix = typeof subBullet === "string" ? undefined : subBullet.boldPrefix;
                return (
                  <li
                    key={subIdx}
                    className="flex items-start gap-3 font-sans text-base leading-relaxed text-[#333134]"
                  >
                    <span
                      className="mt-1 size-4 shrink-0 rounded-[4px] border border-[#C7C1BA] bg-white"
                      aria-hidden="true"
                    />
                    <span>
                      {boldPrefix && (
                        <strong className="mr-1.5 font-bold text-[#130404]">
                          {boldPrefix}
                        </strong>
                      )}
                      <FormattedText text={text} />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : item.isNumberedList ? (
            <ol className="space-y-2 pl-1">
              {item.bullets.map((subBullet, subIdx) => {
                const text = typeof subBullet === "string" ? subBullet : subBullet.text;
                const boldPrefix = typeof subBullet === "string" ? undefined : subBullet.boldPrefix;
                return (
                  <li
                    key={subIdx}
                    className="flex items-start gap-2.5 font-sans text-base leading-relaxed text-[#333134]"
                  >
                    <span className="font-bold text-[#E11D48] shrink-0">
                      {subIdx + 1}.
                    </span>
                    <span>
                      {boldPrefix && (
                        <strong className="mr-1.5 font-bold text-[#130404]">
                          {boldPrefix}
                        </strong>
                      )}
                      <FormattedText text={text} />
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <ul className="space-y-2 pl-6 list-disc marker:text-[#E11D48]">
              {item.bullets.map((subBullet, subIdx) => {
                if (typeof subBullet === "string") {
                  return (
                    <li
                      key={subIdx}
                      className="font-sans text-base leading-relaxed text-[#333134]"
                    >
                      <FormattedText text={subBullet} />
                    </li>
                  );
                }
                return (
                  <li
                    key={subIdx}
                    className="font-sans text-base leading-relaxed text-[#333134]"
                  >
                    {subBullet.boldPrefix && (
                      <strong className="mr-1.5 font-bold text-[#130404]">
                        {subBullet.boldPrefix}
                      </strong>
                    )}
                    <span>
                      <FormattedText text={subBullet.text} />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
