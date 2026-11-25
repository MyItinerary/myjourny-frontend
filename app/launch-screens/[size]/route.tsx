import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { LAUNCH_SCREENS } from "@/lib/launch-screens";

// The iPhone launch images (see appleWebApp.startupImage in app/layout.tsx): a still of the
// in-app launch screen, white with the MyJourny logo in the middle, so opening the home-screen
// app goes straight from this into the pulsing logo instead of a black screen.

/** public/logo/myjourny-logo.svg's proportions, and its height on screen (CSS px), as in the loader. */
const LOGO_RATIO = 210.874 / 35.9173;
const LOGO_HEIGHT = 40;

export const dynamicParams = false;

export function generateStaticParams() {
  return LAUNCH_SCREENS.map(({ size }) => ({ size }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const screen = LAUNCH_SCREENS.find((s) => s.size === size);
  if (!screen) return new Response("Not found", { status: 404 });

  const svg = await readFile(path.join(process.cwd(), "public/logo/myjourny-logo.svg"));
  const logo = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  const height = LOGO_HEIGHT * screen.dpr;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> only */}
        <img src={logo} alt="" width={height * LOGO_RATIO} height={height} />
      </div>
    ),
    { width: screen.width, height: screen.height },
  );
}
