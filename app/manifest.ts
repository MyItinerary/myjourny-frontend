import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION } from "@/lib/site";

// What "Add to Home Screen" / "Install app" uses: the name under the icon, the icon itself,
// and opening full-screen without the browser's address bar and toolbar.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "MyJourny",
    short_name: "MyJourny",
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    icons: [
      { src: "/app-icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icons/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
