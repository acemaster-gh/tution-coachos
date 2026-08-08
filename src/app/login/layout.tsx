import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Sign In — ${siteConfig.instituteName}`,
  description: `Sign in to the ${siteConfig.instituteName} staff and parent portal.`,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
