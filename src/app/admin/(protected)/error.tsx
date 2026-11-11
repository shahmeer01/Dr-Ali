"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Error boundary for the protected admin area. Deliberately generic —
 * no error internals are rendered to the browser.
 */
export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <AlertTriangle
          className="mx-auto h-8 w-8 text-[#a03d2e]"
          aria-hidden="true"
        />
        <h1 className="mt-4 font-display text-[26px] font-medium leading-[1.25] tracking-[-0.01em] text-charcoal">
          Something went wrong
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          An unexpected error occurred while loading this page. Try again, or
          sign out and back in if the problem continues.
        </p>
        <Button type="button" variant="secondary" className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
