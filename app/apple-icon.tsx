import { brandIcon } from "@/lib/brand-icon";

// The iPhone/iPad "Add to Home Screen" icon. Full-bleed square: iOS rounds the corners itself.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return brandIcon(size.width, 0.62);
}
