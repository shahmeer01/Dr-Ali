import { NextResponse } from "next/server";
import { isIP } from "node:net";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseSecretClient } from "@/lib/supabase/service";

/**
 * POST /api/admin/login — server-side email/password sign-in for /admin.
 *
 * Replaces the former loginAction server action because this endpoint must
 * be able to answer with a real HTTP 429 + Retry-After header (rate limiting)
 * and reject malformed JSON/foreign origins before anything is parsed —
 * capabilities Server Actions do not expose.
 *
 * Sequence:
 *   1. Origin must be present and match the request Host (CSRF defence for
 *      JSON endpoints; browsers always send Origin on cross- and same-origin
 *      POST fetches).
 *   2. Content-Type must be application/json and the body must parse.
 *   3. Field validation (same generic copy as the old action).
 *   4. Rate-limit gate (auth_login_rate_check) BEFORE Supabase Auth is
 *      called — the counter is pre-authentication, so an unknown email and
 *      a wrong password are both counted identically (no enumeration).
 *   5. signInWithPassword; on failure record auth_login_rate_fail and
 *      return the same generic error copy as before (identical for unknown
 *      email vs. wrong password).
 *   6. On success clear the email counter (auth_login_rate_clear) and let
 *      @supabase/ssr write the session cookies (HttpOnly via
 *      sessionCookieOptions()) through the route's cookie store.
 *
 * Rate-limit RPCs run on the SECRET-key client (getSupabaseSecretClient):
 * the functions' EXECUTE grant is service_role only (migration
 * 20261111000100), so the public publishable key cannot inspect, increment,
 * or clear counters from outside. Sign-in itself keeps the publishable-key
 * SSR client because only that client writes session cookies. The secret
 * key lives in the server-only SUPABASE_SECRET_KEY env var — never
 * NEXT_PUBLIC_, never in browser code.
 *
 * IP handling (never trust arbitrary client input):
 *   The IP is derived ONLY from proxy headers — the last (proxy-appended)
 *   entry of X-Forwarded-For, else X-Real-IP — and validated with net.isIP.
 *   It is never read from the request body, so a client cannot choose the
 *   bucket of another address. Deployments without a reverse proxy that
 *   sets these headers fall back to email-only limiting (IP = null); a
 *   client that spoofs the headers only affects its own bucket.
 *
 * Failure modes:
 *   * Limiter UNAVAILABLE (migration not applied remotely, grants not yet
 *     updated, or SUPABASE_SECRET_KEY unset/invalid) → fail OPEN: sign-in
 *     proceeds, no limiting, warned once per process without credentials.
 *     Production rate limiting is NOT assumed — never silently claimed.
 *   * Any other rate-limit RPC error (timeout, malformed args, 5xx) →
 *     fail CLOSED (429, Retry-After 60).
 *
 * Nothing in this file logs emails, passwords, tokens, or request bodies.
 */

const MISSING_FIELDS_ERROR = "Enter your email and password.";
const INVALID_CREDENTIALS_ERROR = "Invalid email or password.";
const RATE_LIMITED_ERROR = "Too many attempts. Please wait a moment and try again.";
const GENERIC_FAILURE_ERROR = "Sign-in failed. Please try again.";
const INVALID_REQUEST_ERROR = "Invalid request.";

/** Fail-closed Retry-After when the limiter itself errors unexpectedly. */
const FAIL_CLOSED_RETRY_SECONDS = 60;

let limiterUnavailableWarned = false;

type RpcOutcome =
  | { kind: "ok"; data: Record<string, unknown> | null }
  /** Limiter infrastructure missing/misconfigured → fail open + warn. */
  | { kind: "unavailable" }
  /** Unexpected limiter error → fail closed. */
  | { kind: "error" };

/**
 * RPC errors that mean "limiter infrastructure not ready" (fail open):
 * none of them are attacker-controllable — they are deploy-state signals.
 * Everything else is an unexpected error (fail closed).
 */
function isUnavailableRpcError(code: string | undefined, message: string): boolean {
  if (code === "PGRST2024") return true; // function does not exist (no migration)
  if (code === "42501") return true; // permission denied (grants not yet updated)
  if (code === "PGRST301") return true; // invalid apikey (secret key not provisioned)
  return /could not find the function|does not exist|permission denied|invalid api key|no api key|jwt/i.test(
    message,
  );
}

function warnLimiterUnavailableOnce(): void {
  if (limiterUnavailableWarned) return;
  limiterUnavailableWarned = true;
  console.warn(
    "[admin-login] rate-limit limiter unavailable (missing migration, grants, or SUPABASE_SECRET_KEY) — sign-in continues WITHOUT rate limiting until fixed",
  );
}

async function rateRpc(
  fn: string,
  args: Record<string, unknown>,
): Promise<RpcOutcome> {
  let supabase: ReturnType<typeof getSupabaseSecretClient>;
  try {
    supabase = getSupabaseSecretClient();
  } catch {
    warnLimiterUnavailableOnce();
    return { kind: "unavailable" };
  }
  const { data, error } = await supabase.rpc(fn, args);
  if (!error) {
    return { kind: "ok", data: (data as Record<string, unknown> | null) ?? null };
  }
  const message = error.message ?? "";
  if (isUnavailableRpcError(error.code, message)) {
    warnLimiterUnavailableOnce();
    return { kind: "unavailable" };
  }
  return { kind: "error" };
}

function json(
  status: number,
  body: Record<string, unknown>,
  extraHeaders?: Record<string, string>,
): NextResponse {
  return NextResponse.json(body, { status, headers: extraHeaders });
}

/**
 * Map Supabase Auth errors to safe, generic copy. Raw provider messages
 * (and any internals) are never shown to the user, and the response is
 * identical for unknown email vs. wrong password — no user enumeration.
 */
function friendlySignInError(message: string, code?: string): string {
  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) {
    return INVALID_CREDENTIALS_ERROR;
  }
  if (code === "email_not_confirmed") {
    return "This email has not been confirmed yet. Confirm your email, then try again.";
  }
  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    /rate limit/i.test(message)
  ) {
    return RATE_LIMITED_ERROR;
  }
  return GENERIC_FAILURE_ERROR;
}

/**
 * Server-derived client IP: last entry of X-Forwarded-For (appended by the
 * trusted proxy), else X-Real-IP, validated with net.isIP. Never taken from
 * the request body. Returns null when no trustworthy-looking value exists
 * (email-only limiting applies).
 */
function deriveIp(h: Headers): string | null {
  const candidates: string[] = [];
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) candidates.push(parts[parts.length - 1]);
  }
  const realIp = h.get("x-real-ip");
  if (realIp) candidates.push(realIp.trim());
  for (const candidate of candidates) {
    if (candidate.length <= 45 && isIP(candidate) !== 0) return candidate;
  }
  return null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const reqHeaders = request.headers;

  // 1. Origin must be present and match Host (rejects cross-site JSON POSTs
  //    and non-browser clients that omit Origin entirely).
  const origin = reqHeaders.get("origin");
  const host = reqHeaders.get("host");
  let originHost: string | null = null;
  if (origin) {
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = null;
    }
  }
  if (!originHost || !host || originHost !== host) {
    return json(403, { ok: false, error: INVALID_REQUEST_ERROR });
  }

  // 2. Content type + JSON body.
  const contentType = reqHeaders.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return json(400, { ok: false, error: INVALID_REQUEST_ERROR });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: INVALID_REQUEST_ERROR });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json(400, { ok: false, error: INVALID_REQUEST_ERROR });
  }
  const { email, password } = body as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string") {
    return json(400, { ok: false, error: INVALID_REQUEST_ERROR });
  }

  // 3. Field validation — same generic copy as the previous server action.
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    return json(400, { ok: false, error: MISSING_FIELDS_ERROR });
  }
  if (trimmedEmail.length > 254 || password.length > 256) {
    return json(400, { ok: false, error: INVALID_CREDENTIALS_ERROR });
  }
  const normalizedEmail = trimmedEmail.toLowerCase();

  // 4. Server-derived IP (never from the body) + pre-auth rate-limit gate
  //    (secret-key client — service_role EXECUTE only).
  const ip = deriveIp(reqHeaders);
  const supabase = await getSupabaseServerClient();

  const gate = await rateRpc("auth_login_rate_check", {
    p_email: normalizedEmail,
    p_ip: ip,
  });
  if (gate.kind === "error") {
    // Fail closed: an erroring limiter must not allow unlimited attempts.
    return json(
      429,
      { ok: false, error: RATE_LIMITED_ERROR, retry_after_seconds: FAIL_CLOSED_RETRY_SECONDS },
      { "Retry-After": String(FAIL_CLOSED_RETRY_SECONDS) },
    );
  }
  if (gate.kind === "ok") {
    const allowed = gate.data?.allowed;
    if (allowed !== true) {
      const rawRetry = gate.data?.retry_after_seconds;
      const retry =
        typeof rawRetry === "number" && Number.isInteger(rawRetry) && rawRetry > 0
          ? rawRetry
          : FAIL_CLOSED_RETRY_SECONDS;
      return json(
        429,
        { ok: false, error: RATE_LIMITED_ERROR, retry_after_seconds: retry },
        { "Retry-After": String(retry) },
      );
    }
  }
  // gate.kind === "unavailable" → fail open (warned once inside rateRpc).

  // 5. Sign in (Supabase Auth). Any auth error → record the failure and
  //    return generic copy — identical for unknown email vs. wrong password.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });
  if (signInError) {
    // Best-effort recording on the secret-key client. Both "unavailable"
    // and unexpected errors are ignored: the gate above already ran, and a
    // failed sign-in must still return generic copy.
    await rateRpc("auth_login_rate_fail", {
      p_email: normalizedEmail,
      p_ip: ip,
    });
    return json(401, { ok: false, error: friendlySignInError(signInError.message, signInError.code) });
  }

  // 6. Success — clear the email counter (best-effort; a clear failure must
  //    not undo a successful sign-in). Session cookies were written by
  //    @supabase/ssr through this route's cookie store (HttpOnly).
  await rateRpc("auth_login_rate_clear", {
    p_email: normalizedEmail,
  });

  return json(200, { ok: true });
}
