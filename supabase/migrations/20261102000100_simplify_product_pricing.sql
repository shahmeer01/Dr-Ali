-- =============================================================================
-- Phase 7: Simplify product pricing — price + compare_price
-- Dr. Ali Ahmad Veterinary Care & Animal Health
--
-- Replaces the three-field pricing model:
--   price_text   text          — free-form display string ("Rs. 2,450")
--   price_value  numeric(12,2) — base price used for display + sorting
--   sale_price   numeric(12,2) — discounted price (required base, <= base)
--
-- with two fields:
--   price         numeric(12,2) — what the customer pays; null when the
--                                 price is not confirmed (rendered as
--                                 "Confirmed on WhatsApp", never a number)
--   compare_price numeric(12,2) — optional original price before a discount;
--                                 strictly higher than price (DB-enforced,
--                                 so a fake/equal "discount" cannot exist)
--
-- Backfill (non-destructive — every stored value is preserved):
--   price         = coalesce(sale_price, price_value, parsable price_text)
--   compare_price = price_value, only when sale_price exists and the base is
--                   strictly higher (a "sale" equal to the base carries no
--                   information — price already holds that number)
--   price_text    = KEPT. Legacy display string: rows whose text is not a
--                   parseable amount (e.g. "Confirmed on WhatsApp") keep
--                   rendering it as a fallback when price is null. The
--                   application never writes this column anymore.
--
-- price_value and sale_price are dropped — both are fully migrated into the
-- two new columns above (nothing is discarded).
--
-- NOTE: apply this migration BEFORE deploying code that writes price /
-- compare_price (the admin save action uses those column names).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add the two new columns
-- -----------------------------------------------------------------------------
alter table public.products
  add column price numeric(12, 2),
  add column compare_price numeric(12, 2);

-- -----------------------------------------------------------------------------
-- 2. Backfill price from the old fields
--
-- price_text is only parsed when it is a plain amount with an optional
-- currency prefix/suffix ("Rs. 2,450", "PKR 1200", "1200.50", "1200 PKR").
-- Anything else ("Confirmed on WhatsApp", "Ask us") stays unparsed and keeps
-- rendering through the price_text fallback — never coerced, never lost.
-- -----------------------------------------------------------------------------
update public.products
set price = coalesce(
  sale_price,
  price_value,
  nullif(
    case
      -- Shape check: optional currency token, grouped/plain digits, one decimal.
      when price_text ~* '^[[:space:]]*(?:(?:pkr|rs\.?)[[:space:]]*)?(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.[0-9]{1,2})?[[:space:]]*(?:(?:pkr|rs\.?)[[:space:]]*)?$'
      -- Strip currency tokens, then commas/whitespace, then re-validate the
      -- bare amount before casting (defence against any misparse).
      then case
        when regexp_replace(
               regexp_replace(price_text, '(?:pkr|rs\.?)', '', 'gi'),
               '[,[:space:]]', '', 'g'
             ) ~ '^[0-9]+(\.[0-9]{1,2})?$'
          then (regexp_replace(
                  regexp_replace(price_text, '(?:pkr|rs\.?)', '', 'gi'),
                  '[,[:space:]]', '', 'g'
                ))::numeric
        else null
      end
      else null
    end,
    null
  )
);

-- -----------------------------------------------------------------------------
-- 3. Backfill compare_price (only a genuine, strictly-higher original price)
-- -----------------------------------------------------------------------------
update public.products
set compare_price = price_value
where sale_price is not null
  and price_value is not null
  and price_value > sale_price;

-- -----------------------------------------------------------------------------
-- 4. Constraints on the new model
-- -----------------------------------------------------------------------------
alter table public.products
  add constraint products_price_non_negative
    check (price is null or price >= 0),
  add constraint products_compare_price_non_negative
    check (compare_price is null or compare_price >= 0),
  add constraint products_compare_price_requires_price
    check (compare_price is null or price is not null),
  add constraint products_compare_price_above_price
    check (compare_price is null or compare_price > price);

-- -----------------------------------------------------------------------------
-- 5. Retire the old numeric fields (values fully migrated above)
-- -----------------------------------------------------------------------------
alter table public.products
  drop column price_value,
  drop column sale_price;

-- -----------------------------------------------------------------------------
-- 6. Document the model
-- -----------------------------------------------------------------------------
comment on column public.products.price is
  'What the customer pays (PKR). Null when not confirmed — never rendered as a number.';
comment on column public.products.compare_price is
  'Original price before a discount; strictly higher than price. Rendered struck through with the saving.';
comment on column public.products.price_text is
  'Legacy display string from the three-field pricing model. Read-only fallback shown only when price is null; the application never writes it.';
comment on table public.products is
  'Product listings. price is the price the customer pays; compare_price is the optional pre-discount price; price_text is a legacy display fallback.';
