import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { sessionCookieOptions } from "@/lib/supabase/cookie-options";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Supabase server client (Next.js App Router — @supabase/ssr).
 *
 * For use in Server Components, Server Actions, and route handlers.
 * Reads the request cookies and applies session cookie writes through the
 * provided handlers; writes are a no-op when called from a Server Component
 * (middleware is responsible for refreshing sessions in that flow).
 *
 * `cookies()` is async in Next.js 16, so this function is async.
 * Uses only the publishable (anon) key — never the service-role key.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  await io();
  const { url, publishableKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookieOptions: sessionCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component where cookie writes are not
          // allowed — session refresh is handled by middleware.
        }
      },
    },
  });
}
