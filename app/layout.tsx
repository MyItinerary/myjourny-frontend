import type { Metadata, Viewport } from "next";
import "@fontsource/tiktok-sans/400.css";
import "@fontsource/tiktok-sans/500.css";
import "@fontsource/tiktok-sans/600.css";
import "@fontsource/tiktok-sans/700.css";
import "@fontsource/tiktok-sans/800.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { LAUNCH_SCREENS } from "@/lib/launch-screens";
import { SITE_DESCRIPTION } from "@/lib/site";
import { LaunchScreen } from "./launch-screen";
import { MobileSearchHost } from "./mobile-search-host";
import { MobileTabBar } from "./mobile-tab-bar";

// viewportFit "cover" lets the phone bottom bar and full-screen sheets pad
// themselves with env(safe-area-inset-*). themeColor tints the browser's bars
// (and the installed app's status bar) to match the page.
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#FFFFFF" };

export const metadata: Metadata = {
  title: "MyJourny",
  description: SITE_DESCRIPTION,
  applicationName: "MyJourny",
  // Added to an iPhone's home screen: opens full-screen, named MyJourny (the icon is app/apple-icon.tsx).
  // startupImage replaces iOS's blank (black in dark mode) screen while the app opens.
  appleWebApp: {
    capable: true,
    title: "MyJourny",
    statusBarStyle: "default",
    startupImage: LAUNCH_SCREENS.map(({ size, media }) => ({ url: `/launch-screens/${size}`, media })),
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased overflow-x-clip"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-clip">
        <Providers>
          <LaunchScreen />
          {children}
          <MobileTabBar />
          <MobileSearchHost />
        </Providers>
      </body>
    </html>
  );
}
