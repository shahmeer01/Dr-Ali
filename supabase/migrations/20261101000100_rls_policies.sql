-- =============================================================================
-- Phase 3: Row Level Security foundation
-- Dr. Ali Ahmad Veterinary Care & Animal Health
--
-- Requirements enforced here:
--   * Public visitors read active categories and published products only.
--   * Public visitors can never modify any record (no anon write policies).
--   * Only verified administrators (profiles.role = 'admin') may write
--     products, categories, and product_images.
--   * Admin checks go through public.is_admin(), a SECURITY DEFINER function
--     that reads profiles directly — no user-editable JWT metadata is trusted,
--     and no policy chain recurses (definer rights bypass table RLS).
--   * Users cannot assign themselves the admin role: profiles have no client
--     write policies, and a trigger blocks role changes from user contexts.
--   * Service-role credentials are never used or embedded here.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Secure admin check (single source of truth: public.profiles.role)
-- SECURITY DEFINER + empty search_path: reads profiles without invoking the
-- profiles SELECT policy, which prevents recursive policy evaluation.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Enable RLS on every application table
-- (Default deny: with RLS on and no matching policy, access is refused.)
-- -----------------------------------------------------------------------------
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles       enable row level security;

-- -----------------------------------------------------------------------------
-- categories
--   read:  active rows for everyone; admins additionally see inactive rows
--   write: admin only (to authenticated — an admin is always an authed user)
-- -----------------------------------------------------------------------------
drop policy if exists "Categories readable when active or admin" on public.categories;
create policy "Categories readable when active or admin"
  on public.categories
  for select
  to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories
  for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- products
--   read:  published rows for everyone; admins additionally see drafts
--   write: admin only
-- -----------------------------------------------------------------------------
drop policy if exists "Published products readable or admin" on public.products;
create policy "Published products readable or admin"
  on public.products
  for select
  to anon, authenticated
  using (is_published or public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- product_images
--   read:  visible when its product is published, or for admins (any state)
--          (no recursion: products policies never reference product_images)
--   write: admin only
-- -----------------------------------------------------------------------------
drop policy if exists "Images readable via published product or admin"
  on public.product_images;
create policy "Images readable via published product or admin"
  on public.product_images
  for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_id
        and p.is_published
    )
  );

drop policy if exists "Admins can insert product images" on public.product_images;
create policy "Admins can insert product images"
  on public.product_images
  for insert
  to authenticated
  with check (
    public.is_admin()
    and exists (
      select 1 from public.products p
      where p.id = product_id
    )
  );

drop policy if exists "Admins can update product images" on public.product_images;
create policy "Admins can update product images"
  on public.product_images
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete product images" on public.product_images;
create policy "Admins can delete product images"
  on public.product_images
  for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- profiles
--   read:  own row, or any row for admins
--   write: NONE for clients — profiles are system-managed (signup trigger)
--          and role promotion happens only via trusted database access.
-- -----------------------------------------------------------------------------
drop policy if exists "Read own profile or any as admin" on public.profiles;
create policy "Read own profile or any as admin"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- -----------------------------------------------------------------------------
-- Defense in depth: block role escalation from user contexts.
-- Authenticated clients can never change a role unless they already are
-- admin; direct database access (Supabase Dashboard SQL Editor, service role,
-- migrations — where auth.uid() is null) remains trusted and unaffected.
-- -----------------------------------------------------------------------------
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    -- Profiles are created by the signup trigger; a client context
    -- (auth.uid() present) must never insert an elevated role.
    if auth.uid() is not null and new.role <> 'user' then
      raise exception 'Cannot create a profile with an elevated role';
    end if;
    return new;
  end if;

  if new.role is distinct from old.role then
    if auth.uid() is null then
      return new;  -- trusted database-side context
    end if;
    if not public.is_admin() then
      raise exception 'Only administrators can change roles';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profiles_role_escalation on public.profiles;
create trigger prevent_profiles_role_escalation
  before insert or update on public.profiles
  for each row execute function public.prevent_role_escalation();
