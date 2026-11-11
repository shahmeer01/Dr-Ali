import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/admin/LoginForm";

// Reads searchParams (the `next` return path) — render per request
// (Cache Components: opt out of build-time prerendering).
export const instant = false;

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

/**
 * Only accept internal /admin destinations as post-login targets —
 * blocks open redirects via crafted `?next=` values (`//evil.com`,
 * `https://…`, `/login`, encoded traversal, …).
 */
function sanitizeNext(next: string | null | undefined): string {
  if (next && /^\/admin(\/|$)/.test(next)) return next;
  return "/admin";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = sanitizeNext(rawNext);

  return (
    <div className="bg-ivory">
      <Container size="narrow">
        <div className="flex min-h-[60vh] flex-col justify-center py-14 md:py-20">
          <div className="mx-auto w-full max-w-md">
            <div className="text-center">
              <Lock
                className="mx-auto h-8 w-8 text-forest"
                aria-hidden="true"
              />
              <h1 className="mt-4 font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-charcoal sm:text-[36px]">
                Admin sign in
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Restricted area — authorized practice staff only.
              </p>
            </div>

            <div className="mt-8">
              <LoginForm next={next} />
            </div>

            <p className="mt-6 text-center text-[13px] leading-relaxed text-muted">
              Access is limited to administrator accounts. If you need an
              account, contact the practice owner.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
