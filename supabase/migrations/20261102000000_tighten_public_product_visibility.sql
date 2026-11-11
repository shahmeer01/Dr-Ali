-- =============================================================================
-- Phase 6: Tighten public product visibility to active categories
-- Dr. Ali Ahmad Veterinary Care & Animal Health
--
-- Approved policy updates (exactly two):
--   1. products       — "Published products readable or admin"
--   2. product_images — "Images readable via published product or admin"
--
-- Change: public (anon/non-admin) reads of published products now also
-- require the product's category to be active. Previously an inactive
-- category still exposed its published products through RLS (the app
-- already filtered them; this closes the database-level gap).
--
-- Preserved: all admin access (is_admin() short-circuit), all write
-- policies, and every other table/policy/function/storage object.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- products: published + active category, or admin (drafts stay admin-only)
-- -----------------------------------------------------------------------------
drop policy if exists "Published products readable or admin" on public.products;
create policy "Published products readable or admin"
  on public.products
  for select
  to anon, authenticated
  using (
    public.is_admin()
    or (
      is_published
      and exists (
        select 1 from public.categories c
        where c.id = products.category_id
          and c.is_active
      )
    )
  );

-- -----------------------------------------------------------------------------
-- product_images: visible via a published product in an active category,
-- or for admins (any state)
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
      select 1
      from public.products p
      join public.categories c on c.id = p.category_id
      where p.id = product_id
        and p.is_published
        and c.is_active
    )
  );
