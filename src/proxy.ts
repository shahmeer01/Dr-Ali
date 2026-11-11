import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieOptions } from "@/lib/supabase/cookie-options";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Admin auth gate (Next.js 16 proxy — the successor to middleware).
 *
 * Runs before any /admin route renders:
 *   * refreshes the Supabase session (token rotation) on every matched
 *     request so Server Components always see valid cookies;
 *   * unauthenticated visitors are redirected to /admin/login, with a
 *     `next` parameter so they land where they originally tried to go;
 *   * signed-in visitors on /admin/login are sent to the admin root
 *     (the protected layout then decides panel vs. unauthorized);
 *   * X-Robots-Tag keeps admin URLs out of search indexes.
 *
 * Role verification (profiles.role = 'admin') is deliberately NOT done
 * here: it lives in the protected layout's server component, where the
 * database check runs once per render with the user's own session —
 * RLS allows reading exactly one's own profile row, so no service-role
 * key or privileged client is needed anywhere.
 *
 * Only the publishable (anon) key is used; RLS stays the data boundary.
 */

const ADMIN_ROOT = "/admin";
const LOGIN_PATH = "/admin/login";
const UNAUTHORIZED_PATH = "/admin/unauthorized";

type RefreshedCookie = { name: string; value: string; options?: CookieOptions };

/**
 * Build a redirect for an admin path while carrying any session cookies
 * the request rotated above (otherwise a redirect could drop freshly
 * refreshed tokens and cause a logout loop).
 */
function adminRedirect(
  request: NextRequest,
  targetPath: string,
  refreshed: RefreshedCookie[],
  search = "",
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  url.search = search;
  const response = NextResponse.redirect(url);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  for (const { name, value, options } of refreshed) {
    response.cookies.set(name, value, options);
  }
  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });
  const refreshed: RefreshedCookie[] = [];

  const { url, publishableKey } = getSupabasePublicEnv();
  const supabase = createServerClient(url, publishableKey, {
    cookieOptions: sessionCookieOptions(),
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
          refreshed.push({ name, value, options });
        });
      },
    },
  });

  // getUser() validates the JWT against Supabase Auth (it also triggers
  // token refresh via setAll above). It must run before any other logic;
  // treat any failure as signed-out (fail closed).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow");

  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN_PATH;

  if (!user) {
    // The login page itself is the only admin path open to anonymous
    // visitors; everything else (including /admin/unauthorized, which
    // only makes sense for a signed-in non-admin) goes to login.
    if (isLogin) return supabaseResponse;
    const next = pathname === UNAUTHORIZED_PATH ? "" : pathname;
    return adminRedirect(
      request,
      LOGIN_PATH,
      refreshed,
      next ? `?next=${encodeURIComponent(next)}` : "",
    );
  }

  if (isLogin) {
    // Already signed in — don't show the login form again. The protected
    // layout re-checks the role, so a non-admin lands on /admin/unauthorized.
    return adminRedirect(request, ADMIN_ROOT, refreshed);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
