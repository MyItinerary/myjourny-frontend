/** "₦10,000" */
export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-US")}`;
}
