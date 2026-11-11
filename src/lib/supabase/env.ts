/**
 * Supabase environment access for the publishable (anon) credentials only.
 *
 * Both variables are NEXT_PUBLIC_* so they are inlined at build time — they
 * carry the project URL and the publishable/anon key, which are safe to
 * expose to browsers by design. Service-role keys must never appear here.
 *
 * Failures throw descriptive errors without echoing credential values.
 */

const MISSING_URL =
  "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local with your Supabase project URL (e.g. https://<project-ref>.supabase.co).";

const MISSING_KEY =
  "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Add it to .env.local with your Supabase publishable (anon) key.";

const INVALID_URL =
  "NEXT_PUBLIC_SUPABASE_URL is not a valid absolute URL. Expected your Supabase project URL, e.g. https://<project-ref>.supabase.co.";

export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

/** Resolve and validate the public Supabase credentials, or throw. */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) throw new Error(MISSING_URL);
  if (!publishableKey) throw new Error(MISSING_KEY);

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(INVALID_URL);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(INVALID_URL);
  }

  return { url, publishableKey };
}
