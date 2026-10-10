import type { TasteDrift } from "./taste-drift";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

function spell(n: number) {
  return NUMBER_WORDS[n] ?? String(n);
}

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// Figma: "Your taste has drifted." (558:13485)
export function driftCopy(drift: TasteDrift) {
  return {
    title: "Your taste has drifted.",
    body: `You’ve booked ${spell(drift.count)} experiences in ${drift.category} since you told us you were into ${joinList(drift.interests)}. Want to update what we show you?`,
    ctaLabel: "Update my taste",
  };
}
