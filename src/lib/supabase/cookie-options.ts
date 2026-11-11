import type { CookieOptions } from "@supabase/ssr";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Flags for every server-side write of the Supabase session cookies —
 * login (POST /api/admin/login), token rotation (proxy), and logout
 * (logoutAction).
 *
 * - httpOnly: tokens are never exposed to browser JavaScript, so an
 *   injected script cannot read or replay the session. Only the server
 *   can set this flag, which is why sign-in runs in a route handler.
 * - secure: HTTPS-only in production; stays false outside production so
 *   plain-HTTP local development (http://localhost and LAN hosts) keeps
 *   working — browsers drop Secure cookies on insecure origins.
 * - sameSite=lax: blocks cross-site POST cookie sends (CSRF hardening)
 *   while keeping normal top-level navigation working.
 */
export function sessionCookieOptions(): CookieOptions {
  return {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: isProduction,
  };
}
