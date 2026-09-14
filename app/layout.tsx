import type { Metadata } from "next";
import "@fontsource/tiktok-sans/400.css";
import "@fontsource/tiktok-sans/500.css";
import "@fontsource/tiktok-sans/600.css";
import "@fontsource/tiktok-sans/700.css";
import "@fontsource/tiktok-sans/800.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "MyJourny",
  description: "MyJourny | connecting travellers with local guides for curated experiences",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
