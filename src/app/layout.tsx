import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import "./globals.css";

// NOTE: Google Fonts are loaded via @import url() in globals.css at
// browser runtime, which works even when fonts.googleapis.com is
// blocked at build time (sandbox constraint).  On Vercel/your machine
// you can swap to next/font/google — see FONTS.md for the exact code.

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.instituteName} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.instituteName}`,
  },
  description: `${siteConfig.instituteName} in ${siteConfig.city}. ${siteConfig.tagline}. Online fee payment, live progress tracking, automatic parent alerts.`,
  keywords: [
    siteConfig.instituteName,
    siteConfig.city,
    "coaching centre",
    "tutor near me",
    "online coaching",
    ...siteConfig.subjects,
  ],
  authors: [{ name: siteConfig.instituteName }],
  openGraph: {
    title: `${siteConfig.instituteName} — ${siteConfig.tagline}`,
    description: siteConfig.tagline,
    type: "website",
    siteName: siteConfig.instituteName,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.instituteName} — ${siteConfig.tagline}`,
    description: siteConfig.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Font preconnects for faster Google Fonts loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
