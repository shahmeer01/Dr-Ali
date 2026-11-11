import { Container } from "@/components/ui/Container";

/** Instant feedback while the server verifies the session and role. */
export default function AdminLoading() {
  return (
    <Container>
      <div
        role="status"
        aria-label="Verifying access"
        className="mx-auto max-w-2xl"
      >
        <div className="h-9 w-2/3 animate-pulse rounded-control bg-white/60" />
        <div className="mt-5 h-5 w-full animate-pulse rounded-control bg-white/60" />
        <div className="mt-3 h-5 w-4/5 animate-pulse rounded-control bg-white/60" />
        <span className="sr-only">Verifying access…</span>
      </div>
    </Container>
  );
}
