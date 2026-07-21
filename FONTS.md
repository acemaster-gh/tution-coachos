# Restoring real fonts (Fraunces / Inter / Caveat)

This sandbox can't reach fonts.googleapis.com (its network is locked to
package registries), so `layout.tsx` currently uses system-font fallbacks.
The very first thing to do once you have this running locally or on Vercel
is restore the real type system — replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-marginalia",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${siteConfig.instituteName} — ${siteConfig.tagline}`,
  description: siteConfig.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

And in `src/app/globals.css`, change the three `--font-*` lines under
`@theme inline` back to:

```css
--font-display: var(--font-display);
--font-body: var(--font-body);
--font-marginalia: var(--font-marginalia);
```

That's it — `npm run dev` will fetch and self-host the fonts automatically.
