import { createClient } from "@supabase/supabase-js";

/**
 * Supabase SECRET-key client — server-only, minimum privileges.
 *
 * Uses SUPABASE_SECRET_KEY (Settings → API → secret key / legacy
 * service_role). Supabase maps that key to the service_role database role,
 * which this project grants EXECUTE on exactly three functions:
 * auth_login_rate_check / auth_login_rate_fail / auth_login_rate_clear
 * (migration 20261111000100). No table privileges are granted to any role;
 * the SECURITY DEFINER functions own all counter access.
 *
 * Hard rules:
 *   * This variable must NEVER be prefixed NEXT_PUBLIC_ — Next.js inlines
 *     NEXT_PUBLIC_* into client bundles at build time. It is read here at
 *     runtime, server-side only (route handlers).
 *   * Import this module only from server code (route handlers / server
 *     actions). Never from client components.
 *   * This client has no cookie handlers and no session persistence — it
 *     exists solely for the three rate-limit RPCs. Sign-in and session
 *     cookies continue to use getSupabaseServerClient() (publishable key).
 *
 * Failures throw descriptive errors WITHOUT echoing credential values.
 */

const MISSING_SECRET_KEY =
  "Missing SUPABASE_SECRET_KEY. Add the Supabase secret key (Settings → API) to .env.local as a server-only variable — never NEXT_PUBLIC_SUPABASE_SECRET_KEY.";

const MISSING_URL =
  "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local with your Supabase project URL.";

export type SupabaseSecretEnv = {
  url: string;
  secretKey: string;
};

/** Resolve and validate the server-only secret credentials, or throw. */
export function getSupabaseSecretEnv(): SupabaseSecretEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url) throw new Error(MISSING_URL);
  if (!secretKey) throw new Error(MISSING_SECRET_KEY);
  return { url, secretKey };
}

/**
 * Stateless Supabase client authenticated with the secret key.
 * RPC-only: no auth persistence, no cookie storage, no session refresh.
 */
export function getSupabaseSecretClient() {
  const { url, secretKey } = getSupabaseSecretEnv();
  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
