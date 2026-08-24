import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "@fontsource/tiktok-sans/400.css";
import "@fontsource/tiktok-sans/500.css";
import "@fontsource/tiktok-sans/600.css";
import "@fontsource/tiktok-sans/700.css";
import "@fontsource/tiktok-sans/800.css";
import "./globals.css";
import { Providers } from "@/components/providers";

// Placeholder — no monospace usage confirmed in the designs yet.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyJourny",
  description: "MyJourny — connecting travellers with local guides for curated experiences",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
