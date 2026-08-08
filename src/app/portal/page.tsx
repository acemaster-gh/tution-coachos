// Bare /portal — middleware redirects authenticated users to their role
// dashboard before this page ever renders. This is a safety fallback only.
import { redirect } from "next/navigation";

export default function PortalIndexPage() {
  redirect("/login");
}
