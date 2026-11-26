import { brandIcon } from "@/lib/brand-icon";

// The browser-tab favicon.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return brandIcon(size.width, 0.7);
}
