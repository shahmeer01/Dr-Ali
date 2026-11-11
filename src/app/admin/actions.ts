"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Sign out of Supabase Auth from the server.
 *
 * Running signOut through the server client clears the session cookies
 * via the cookie write handlers (allowed in Server Actions). Even if the
 * network call fails we still redirect — the proxy treats any invalid
 * session as signed-out, so the user always lands on the login page.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // Intentionally ignored — redirecting is still the safe outcome.
  }
  redirect("/admin/login");
}
