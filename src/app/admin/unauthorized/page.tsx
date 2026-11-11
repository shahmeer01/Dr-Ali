import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "Access denied",
  robots: { index: false, follow: false },
};

/**
 * Shown to authenticated users whose profiles.role is not 'admin'
 * (redirected here by the protected layout). Deliberately outside the
 * (protected) group so it does not re-trigger the role gate; the proxy
 * still requires a session, so anonymous visitors are sent to login.
 */
export default function AdminUnauthorizedPage() {
  return (
    <div className="bg-ivory">
      <Container size="narrow">
        <div className="flex min-h-[55vh] flex-col justify-center py-14 text-center md:py-20">
          <ShieldAlert
            className="mx-auto h-10 w-10 text-[#a03d2e]"
            aria-hidden="true"
          />
          <h1 className="mt-4 font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-charcoal sm:text-[36px]">
            Access denied
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
            Your account is signed in but does not have administrator
            access. If you believe this is a mistake, ask the practice owner
            to update your role.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LogoutButton />
            <Button href="/" variant="secondary" size="sm">
              Back to site
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
