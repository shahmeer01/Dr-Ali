-- =============================================================================
-- Phase 3: Seed categories
-- Dr. Ali Ahmad Veterinary Care & Animal Health
--
-- The five existing categories from src/data/products.ts (productCategories),
-- preserving their slugs, names, descriptions, and image paths.
--
-- Idempotent: ON CONFLICT (slug) DO NOTHING — re-running never creates
-- duplicates and never overwrites rows an admin has edited. A fresh database
-- receives all five rows; a re-run is a no-op.
--
-- Runs as the migration role (postgres), which owns the tables, so RLS
-- enabled in the previous migration does not block this insert.
-- =============================================================================

insert into public.categories (name, slug, description, image_path, sort_order, is_active)
values
  (
    'Pet Food',
    'pet-food',
    'Dry food, treats, and everyday nutrition for dogs and cats.',
    '/images/dog-food-bowl.jpg',
    10,
    true
  ),
  (
    'Animal Feed',
    'animal-feed',
    'Feed and nutritional supplements for cattle, buffalo, and small livestock.',
    '/images/cattle-feed.jpg',
    20,
    true
  ),
  (
    'Grooming Products',
    'grooming',
    'Shampoos, brushes, and coat-care essentials for regular grooming.',
    '/images/dog-grooming.jpg',
    30,
    true
  ),
  (
    'Pet Accessories',
    'accessories',
    'Collars, leashes, bowls, and everyday handling accessories.',
    '/images/dog-collar-leash.jpg',
    40,
    true
  ),
  (
    'Animal Healthcare Products',
    'healthcare',
    'Supportive care products discussed with your veterinarian before use.',
    '/images/medicine-bottle.jpg',
    50,
    true
  )
on conflict (slug) do nothing;
