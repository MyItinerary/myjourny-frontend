import Link from "next/link";

export function FormattedText({ text }: { text: string }) {
  if (!text) return null;
  if (!text.includes("**") && !text.includes("[")) {
    return <>{text}</>;
  }

  // Matches either **bold text** or [link text](url)
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-[#130404]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
          const closeBracket = part.indexOf("](");
          const label = part.slice(1, closeBracket);
          const href = part.slice(closeBracket + 2, -1);
          return (
            <Link
              key={i}
              href={href}
              className="text-[#E11D48] underline hover:text-[#BE123C]"
            >
              {label}
            </Link>
          );
        }
        return part;
      })}
    </>
  );
}
