const pad = (n: number) => String(n).padStart(2, "0");

/** The coming Saturday (today if it is one) as YYYY-MM-DD, for "available this weekend". */
export function nextSaturday(from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
