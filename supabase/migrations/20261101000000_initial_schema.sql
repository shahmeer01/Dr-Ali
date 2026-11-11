-- =============================================================================
-- Phase 3: Initial application schema
-- Dr. Ali Ahmad Veterinary Care & Animal Health
--
-- Aligns with the TypeScript types in src/data/products.ts:
--   ProductCategorySlug  -> categories.slug  (unique + kebab-case only; the DB
--                           does NOT hard-code the current union — admins can
--                           add categories without migrations)
--   ProductAvailability  -> products.availability (CHECK: in-stock|on-request|unavailable)
--   Product.details?: string -> products.details TEXT (plain string, not JSONB,
--                                to preserve Product['details'] compatibility)
--   Product.price / priceValue -> products.price_text / price_value
--   Product.image -> products.image_path (public path or future Storage path)
--
-- Notes:
--   * Categories are dynamic: slug is only constrained to unique kebab-case,
--     so administrators can create new categories without application-code or
--     migration changes. Public navigation picks new categories up via the
--     data-fetch layer in a later phase.
--   * Nothing here is applied to any remote database; this file is inert SQL.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  slug        text not null unique
                check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  image_path  text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.categories is
  'Product categories. Slugs are unique kebab-case and freely extensible by admins.';

-- -----------------------------------------------------------------------------
-- products
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(trim(name)) > 0),
  slug         text not null unique
                 check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  brand        text check (brand is null or length(trim(brand)) > 0),
  category_id  uuid not null references public.categories (id) on delete restrict,
  description  text not null check (length(trim(description)) > 0),
  details      text,
  price_text   text check (price_text is null or length(trim(price_text)) > 0),
  price_value  numeric(12, 2) check (price_value is null or price_value >= 0),
  sale_price   numeric(12, 2) check (sale_price is null or sale_price >= 0),
  size         text check (size is null or length(trim(size)) > 0),
  availability text check (availability is null or
                           availability in ('in-stock', 'on-request', 'unavailable')),
  image_path   text,
  image_alt    text,
  is_featured  boolean not null default false,
  is_published boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Sale price is only meaningful alongside a base price.
  constraint products_sale_price_requires_base_price
    check (sale_price is null or price_value is not null),
  -- A sale price can never exceed the base price.
  constraint products_sale_price_not_above_base_price
    check (sale_price is null or price_value is null or sale_price <= price_value),
  -- Every product belongs to a category (matches Product.category).
  constraint products_has_category check (category_id is not null)
);

comment on table public.products is
  'Product listings. price_text is the display price; price_value is numeric sort.';

-- -----------------------------------------------------------------------------
-- product_images (gallery beyond the primary products.image_path)
-- -----------------------------------------------------------------------------
create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_path text not null check (length(trim(image_path)) > 0),
  alt_text   text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.product_images is
  'Gallery images per product. Deleting a product cascades its images.';

-- -----------------------------------------------------------------------------
-- profiles (one row per auth.users entry; holds the trusted admin role)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'user'
               check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'User profiles keyed to auth.users. Role column is the sole admin source of truth.';

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order);

create index if not exists products_category_id_idx
  on public.products (category_id);

create index if not exists products_published_sort_idx
  on public.products (is_published, sort_order);

create index if not exists products_featured_idx
  on public.products (is_featured, sort_order)
  where is_featured;

create index if not exists product_images_product_idx
  on public.product_images (product_id, sort_order);

-- At most one primary image per product.
create unique index if not exists product_images_one_primary_idx
  on public.product_images (product_id)
  where is_primary;

-- -----------------------------------------------------------------------------
-- updated_at maintenance trigger (categories, products, profiles)
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Profile auto-creation on signup (role defaults to 'user' — never admin)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
