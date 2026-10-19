"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Shared scroll restoration for the App Router.
 *
 * Next.js manages scroll itself, but client navigations can retain the
 * previous page's scroll offset (especially with streamed/PPR payloads).
 * This resets to the top on real page navigations while preserving:
 * - same-page anchor links (pathname unchanged, or a #hash target)
 * - browser back/forward restoration (popstate is flagged and skipped)
 * - scroll position on hard reloads (first render is skipped)
 *
 * The pathname is tracked explicitly so StrictMode's duplicate effect
 * invocations (dev) cannot consume a one-shot flag.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const popped = useRef<string | null>(null);

  useEffect(() => {
    const onPopState = () => {
      popped.current = window.location.pathname;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (lastPath.current === null) {
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (popped.current) {
      if (popped.current === pathname) return;
      popped.current = null;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
