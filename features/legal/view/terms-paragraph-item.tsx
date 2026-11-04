import type { TermsParagraph } from "../model/terms.types";
import { FormattedText } from "./formatted-text";

export function TermsParagraphItem({ item }: { item: TermsParagraph }) {
  return (
    <div className="space-y-2">
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

      {item.bullets && item.bullets.length > 0 && (
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
    </div>
  );
}
