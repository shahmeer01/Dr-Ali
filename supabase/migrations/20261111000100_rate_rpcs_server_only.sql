-- =============================================================================
-- Phase 2 (auth hardening): rate-limit RPCs are server-only
-- Dr. Ali Ahmad Veterinary Care & Animal Health
--
-- Supersedes the EXECUTE-to-anon grants in
-- 20261111000000_auth_login_rate_limit.sql (append-only migration; this
-- file changes grants only — no schema or function bodies).
--
-- Problem (verified by abuse test): anon is the role behind the PUBLIC
-- publishable key, so anyone holding that key could call
-- auth_login_rate_check / auth_login_rate_fail / auth_login_rate_clear
-- directly to:
--   * inspect any email/IP lock state (oracle),
--   * increment arbitrary counters (lock out victims — DoS on login),
--   * clear any lockout (full rate-limit bypass after brute force).
--
-- Fix: EXECUTE granted ONLY to service_role. PostgREST authenticates
-- service_role exclusively with the project's secret key, which this app
-- keeps server-side in the SUPABASE_SECRET_KEY env var
-- (src/lib/supabase/service.ts — no NEXT_PUBLIC_ prefix, never shipped to
-- the browser). POST /api/admin/login uses a secret-key client for exactly
-- these three RPC calls; sign-in and session cookies keep the publishable
-- key via the existing SSR server client.
--
-- Unchanged and deliberately so:
--   * auth_login_attempts table: no role has direct access (revokes in the
--     original migration stand); only the SECURITY DEFINER functions
--     (owner) touch it — this migration grants no table privileges.
--   * authenticated still has no EXECUTE (login is pre-session).
--   * RLS on every other table: untouched.
--
-- Deployment note: apply this migration together with (or before) the
-- server build that uses SUPABASE_SECRET_KEY. If either is missing, the
-- login route fails OPEN (sign-in works, no limiting) and warns once —
-- it never silently claims production rate limiting is active.
--
-- Nothing here has been applied to any remote database.
-- =============================================================================

revoke execute on function public.auth_login_rate_check(text, inet)
  from public, anon, authenticated, service_role;
grant execute on function public.auth_login_rate_check(text, inet)
  to service_role;

revoke execute on function public.auth_login_rate_fail(text, inet)
  from public, anon, authenticated, service_role;
grant execute on function public.auth_login_rate_fail(text, inet)
  to service_role;

revoke execute on function public.auth_login_rate_clear(text)
  from public, anon, authenticated, service_role;
grant execute on function public.auth_login_rate_clear(text)
  to service_role;
