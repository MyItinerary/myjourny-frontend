import { brandIcon } from "@/lib/brand-icon";

// The web-app manifest's icons (see app/manifest.ts). Maskable keeps the mark inside the
// centre circle Android may crop the icon to.
const VARIANTS = {
  "192": { size: 192, markWidth: 0.62 },
  "512": { size: 512, markWidth: 0.62 },
  "maskable-512": { size: 512, markWidth: 0.5 },
} as const;

type Variant = keyof typeof VARIANTS;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((variant) => ({ variant }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const icon = VARIANTS[variant as Variant];
  if (!icon) return new Response("Not found", { status: 404 });
  return brandIcon(icon.size, icon.markWidth);
}
