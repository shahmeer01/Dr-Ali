-- =============================================================================
-- Phase 2 (auth hardening): Server-side login rate limiting
-- Dr. Ali Ahmad Veterinary Care & Animal Health
--
-- Adds per-email and per-IP failed-attempt counters with atomic upserts.
-- POST /api/admin/login consults them BEFORE Supabase Auth is called:
--   * auth_login_rate_check — read-only gate; returns allowed/retry_after
--   * auth_login_rate_fail   — atomic counter increment after a failed sign-in
--   * auth_login_rate_clear  — drops the EMAIL counter after a successful sign-in
--
-- Policy: 5 failed attempts per email per 15 minutes; 20 per IP per 15 minutes.
-- A successful login clears only the email counter (the IP counter keeps its
-- history for the window). Window expiry resets the counter on the next
-- recorded failure (fixed window, no background jobs).
--
-- Security posture:
--   * Table: RLS enabled with NO policies and revokes for every role → direct
--     access denied to all; only the SECURITY DEFINER functions touch it.
--   * Functions: SECURITY DEFINER with a fixed empty search_path
--     (set search_path = '' — matches public.is_admin()), all object names
--     schema-qualified, EXECUTE granted ONLY to anon (login runs pre-session);
--     the Postgres default EXECUTE-to-PUBLIC grant is revoked.
--   * Inputs validated inside the functions: email shape/length (text),
--     IP via the inet type (PostgREST rejects malformed casts pre-execution),
--     bucket keys normalized (btrim/lower for email, inet::text for IP).
--   * Counters are only mutated by the atomic INSERT ... ON CONFLICT upsert
--     inside auth_login_rate_fail — each counter update is a single atomic
--     statement; the function body runs in one transaction.
--
-- Nothing here has been applied to the remote project. Until this migration
-- is applied there, the login route fails OPEN (sign-in works, no limiting)
-- and logs a warning without credentials — see src/app/api/admin/login.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Counter table: (scope, bucket) → attempts inside the current window
-- -----------------------------------------------------------------------------
create table if not exists public.auth_login_attempts (
  scope             text not null check (scope in ('email', 'ip')),
  bucket            text not null check (length(bucket) > 0 and length(bucket) <= 320),
  window_started_at timestamptz not null default now(),
  attempts          integer not null default 0 check (attempts >= 0),
  primary key (scope, bucket)
);

comment on table public.auth_login_attempts is
  'Failed-login counters keyed by scope (email|ip) and bucket key. Only SECURITY DEFINER rate-limit functions may touch it.';

-- Defence in depth: no policies + revokes → no direct access for any role;
-- the SECURITY DEFINER functions below run as the owner and bypass RLS.
alter table public.auth_login_attempts enable row level security;

revoke all on table public.auth_login_attempts from public, anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- auth_login_rate_check — read-only gate, called BEFORE Supabase Auth
-- Returns: {"allowed": bool, "scope": "email"|"ip"|null, "retry_after_seconds": int|null}
-- Raises on invalid input (fail closed at the application layer).
-- -----------------------------------------------------------------------------
create or replace function public.auth_login_rate_check(p_email text, p_ip inet)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email_limit constant integer := 5;
  v_ip_limit    constant integer := 20;
  v_window      constant interval := interval '15 minutes';
  v_email       text;
  v_started     timestamptz;
  v_attempts    integer;
  v_retry       integer;
begin
  -- Validate inputs (defence in depth; the route validates first too).
  if p_email is null or length(btrim(p_email)) < 3 or length(p_email) > 254
     or btrim(p_email) !~ '^[^@[:space:]]+@[^@[:space:]]+$' then
    raise exception 'auth_login_rate_check: invalid email input';
  end if;
  v_email := lower(btrim(p_email));

  select a.attempts, a.window_started_at
    into v_attempts, v_started
    from public.auth_login_attempts a
   where a.scope = 'email' and a.bucket = v_email;
  if found and v_started > now() - v_window and v_attempts >= v_email_limit then
    v_retry := greatest(1, ceil(extract(epoch from (v_started + v_window - now())))::integer);
    return jsonb_build_object(
      'allowed', false,
      'scope', 'email',
      'retry_after_seconds', v_retry
    );
  end if;

  if p_ip is not null then
    select a.attempts, a.window_started_at
      into v_attempts, v_started
      from public.auth_login_attempts a
     where a.scope = 'ip' and a.bucket = p_ip::text;
    if found and v_started > now() - v_window and v_attempts >= v_ip_limit then
      v_retry := greatest(1, ceil(extract(epoch from (v_started + v_window - now())))::integer);
      return jsonb_build_object(
        'allowed', false,
        'scope', 'ip',
        'retry_after_seconds', v_retry
      );
    end if;
  end if;

  return jsonb_build_object(
    'allowed', true,
    'scope', null,
    'retry_after_seconds', null
  );
end;
$$;

revoke execute on function public.auth_login_rate_check(text, inet) from public;
grant execute on function public.auth_login_rate_check(text, inet) to anon;

-- -----------------------------------------------------------------------------
-- auth_login_rate_fail — atomic increments after a failed sign-in
-- Each counter is one INSERT ... ON CONFLICT DO UPDATE statement (atomic);
-- both counters update inside a single transaction.
-- Returns: {"email_attempts": int, "ip_attempts": int|null}
-- Raises on invalid input (fail closed at the application layer).
-- -----------------------------------------------------------------------------
create or replace function public.auth_login_rate_fail(p_email text, p_ip inet)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email_limit constant integer := 5;
  v_ip_limit    constant integer := 20;
  v_window      constant interval := interval '15 minutes';
  v_email       text;
  v_email_count integer;
  v_ip_count    integer := null;
begin
  if p_email is null or length(btrim(p_email)) < 3 or length(p_email) > 254
     or btrim(p_email) !~ '^[^@[:space:]]+@[^@[:space:]]+$' then
    raise exception 'auth_login_rate_fail: invalid email input';
  end if;
  v_email := lower(btrim(p_email));

  insert into public.auth_login_attempts as t
    (scope, bucket, window_started_at, attempts)
  values
    ('email', v_email, now(), 1)
  on conflict (scope, bucket) do update
    set attempts = case
          when t.window_started_at <= now() - v_window then 1
          else t.attempts + 1
        end,
        window_started_at = case
          when t.window_started_at <= now() - v_window then now()
          else t.window_started_at
        end
  returning t.attempts into v_email_count;

  if p_ip is not null then
    insert into public.auth_login_attempts as t
      (scope, bucket, window_started_at, attempts)
    values
      ('ip', p_ip::text, now(), 1)
    on conflict (scope, bucket) do update
      set attempts = case
            when t.window_started_at <= now() - v_window then 1
            else t.attempts + 1
          end,
          window_started_at = case
            when t.window_started_at <= now() - v_window then now()
            else t.window_started_at
          end
    returning t.attempts into v_ip_count;
  end if;

  return jsonb_build_object(
    'email_attempts', v_email_count,
    'ip_attempts', v_ip_count
  );
end;
$$;

revoke execute on function public.auth_login_rate_fail(text, inet) from public;
grant execute on function public.auth_login_rate_fail(text, inet) to anon;

-- -----------------------------------------------------------------------------
-- auth_login_rate_clear — successful login drops the EMAIL counter only
-- Returns: true when a row was removed.
-- Raises on invalid input (fail closed at the application layer).
-- -----------------------------------------------------------------------------
create or replace function public.auth_login_rate_clear(p_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_deleted integer;
begin
  if p_email is null or length(btrim(p_email)) < 3 or length(p_email) > 254
     or btrim(p_email) !~ '^[^@[:space:]]+@[^@[:space:]]+$' then
    raise exception 'auth_login_rate_clear: invalid email input';
  end if;
  v_email := lower(btrim(p_email));

  delete from public.auth_login_attempts a
   where a.scope = 'email' and a.bucket = v_email;
  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

revoke execute on function public.auth_login_rate_clear(text) from public;
grant execute on function public.auth_login_rate_clear(text) to anon;
