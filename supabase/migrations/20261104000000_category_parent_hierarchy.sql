-- =============================================================================
-- Phase 2: Category hierarchy — optional parent-child relationships
--
-- Adds a nullable self-referencing parent_category_id to categories:
--   * NULL      -> top-level category (the default; every existing row
--                  stays exactly as it is — the column is added with no
--                  default, so all current categories become top-level).
--   * uuid      -> nested subcategory under another category.
--
-- Design notes:
--   * ON DELETE RESTRICT mirrors products.category_id: a parent with
--     children cannot be deleted until the children are moved or removed
--     (deleteCategoryAction already surfaces FK 23503 as a clear error).
--   * A CHECK constraint makes a self-parent impossible at the database
--     level; longer cycles (A -> B -> A) are prevented by ancestor-walk
--     validation in saveCategoryAction (admin-only, RLS hard boundary).
--   * RLS is untouched: the existing table-level policies on categories
--     apply to the new column for every role.
--   * The partial index covers parent lookups/hierarchy walks without
--     indexing the (dominant) NULL top-level rows.
--
-- Idempotent: safe to re-run (column/constraint/index are guarded).
-- =============================================================================

alter table public.categories
  add column if not exists parent_category_id uuid
  references public.categories (id) on delete restrict;

comment on column public.categories.parent_category_id is
  'Optional parent category. NULL = top-level. Cycles are prevented by the categories_no_self_parent check plus app-level ancestor validation.';

-- A category can never be its own parent.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_no_self_parent'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_no_self_parent
      check (parent_category_id is distinct from id);
  end if;
end $$;

-- Hierarchy lookups (children of a category); NULLs are excluded.
create index if not exists categories_parent_idx
  on public.categories (parent_category_id)
  where parent_category_id is not null;
