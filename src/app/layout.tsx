import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import "./globals.css";

// NOTE: This sandbox's network is locked to package registries only, so it
// can't reach fonts.googleapis.com to prove the build. On your machine or on
// Vercel, swap this block back to next/font/google — see FONTS.md for the
// exact code (Fraunces / Inter / Caveat). The fallback stacks below
// approximate the same feel in the meantime.

export const metadata: Metadata = {
  title: `${siteConfig.instituteName} — ${siteConfig.tagline}`,
  description: siteConfig.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
