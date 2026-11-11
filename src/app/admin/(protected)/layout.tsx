import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Auth checks below use cookies() — this segment must render per request
// (Cache Components: opt out of build-time prerendering).
export const instant = false;

/**
 * Server-side authorization for every route under /admin/(protected)
 * (i.e. /admin and anything else added to this group later).
 *
 * The proxy already redirects anonymous visitors; this layout is the
 * second, authoritative layer:
 *   * re-validates the session with Supabase Auth (getUser);
 *   * reads profiles.role with the user's own session — RLS only lets a
 *     user read their own profile row, and role is never client-writable
 *     (DB trigger blocks escalation), so this check cannot be spoofed;
 *   * anything other than role = 'admin' — including a missing profile
 *     row or a failed query — is denied and sent to /admin/unauthorized
 *     (fail closed).
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/admin/unauthorized");

  return (
    <div className="bg-ivory">
      <header className="border-b border-border-subtle bg-white">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate font-display text-[17px] font-medium leading-tight tracking-[-0.01em] text-charcoal">
                  Admin panel
                </p>
                <p className="truncate text-[12px] leading-tight text-muted">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <nav
                aria-label="Admin"
                className="flex items-center gap-4 text-[14px]"
              >
                <Link
                  href="/admin"
                  className="text-muted transition-colors duration-[180ms] hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/products"
                  className="text-muted transition-colors duration-[180ms] hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  Products
                </Link>
                <Link
                  href="/admin/categories"
                  className="text-muted transition-colors duration-[180ms] hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  Categories
                </Link>
                <Link
                  href="/"
                  className="hidden text-muted transition-colors duration-[180ms] hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:inline"
                >
                  View site
                </Link>
              </nav>
              <LogoutButton />
            </div>
          </div>
        </Container>
      </header>
      <div className="py-10 md:py-12">{children}</div>
    </div>
  );
}
