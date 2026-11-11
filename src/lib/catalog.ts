import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import {
  productCategories,
  type Product,
  type ProductAvailability,
  type ProductCategorySlug,
} from "@/data/products";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  categoryHref,
  isStorageProductPath,
  resolveProductImage,
  resolveProductPrice,
  type AdminCategoryDetailRow,
  type AdminCategoryRow,
  type AdminProductRow,
  type PublicCategory,
} from "@/lib/product-shared";

/**
 * Server-side product catalogue backed by Supabase (PostgreSQL + RLS).
 *
 * Public fetches below filter `is_published` at the application level for
 * EVERY caller — unpublished products never reach the homepage, listings,
 * category pages, detail pages, related grids, or search payloads, even
 * with an admin session (drafts are managed exclusively in /admin).
 * RLS enforces the same rule at the database as defence in depth: the
 * "Published products readable or admin" policy blocks anon/non-admin
 * reads of drafts, and only admins can write.
 *
 * No service-role key is used anywhere; this module must never be imported
 * from a client component (see product-shared.ts for the isomorphic bits).
 */

export type { AdminCategoryDetailRow, AdminCategoryRow, AdminProductRow, PublicCategory };

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string;
  details: string | null;
  price: number | string | null;
  compare_price: number | string | null;
  price_text: string | null;
  size: string | null;
  availability: string | null;
  image_path: string | null;
  image_alt: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  categories: { id: string; name: string; slug: string } | null;
  /** Gallery embed — only present on the detail/admin fetches. */
  product_images?: {
    id: string;
    image_path: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }[];
};

function mapToProduct(row: ProductRow): Product {
  const pricing = resolveProductPrice(row);
  const availability = row.availability as ProductAvailability | null;
  const primaryImage = resolveProductImage(row.image_path);
  const product: Product = {
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? undefined,
    // DB slugs are open-ended; unknown slugs degrade gracefully in
    // getCategoryBySlug / category chips rather than being dropped.
    category: (row.categories?.slug ?? "pet-food") as ProductCategorySlug,
    description: row.description,
    details: row.details ?? undefined,
    price: pricing.price,
    priceValue: pricing.priceValue,
    comparePrice: pricing.comparePrice,
    discountPercent: pricing.discountPercent,
    size: row.size ?? undefined,
    availability: availability ?? undefined,
    image: primaryImage,
    imageAlt: row.image_alt ?? undefined,
  };

  // Detail/admin fetches embed the gallery; list fetches leave it unset so
  // cards keep using the synced primary (`image`) only.
  if (row.product_images) {
    const gallery = [...row.product_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        src: resolveProductImage(item.image_path),
        alt: item.alt_text ?? row.image_alt ?? row.name,
        isPrimary: item.is_primary,
      }))
      .filter((item): item is { src: string; alt: string; isPrimary: boolean } =>
        Boolean(item.src),
      );
    if (gallery.length === 0 && primaryImage) {
      // Legacy single-image product: no rows yet — the primary pointer is
      // the whole gallery until the product is next saved in the admin.
      gallery.push({
        src: primaryImage,
        alt: row.image_alt ?? row.name,
        isPrimary: true,
      });
    }
    product.images = gallery;
  }

  return product;
}

const PRODUCT_SELECT = "*, categories!inner(id, name, slug)";
/** Detail-page select: everything a product page needs, gallery included. */
const PRODUCT_SELECT_WITH_GALLERY =
  `${PRODUCT_SELECT}, product_images(id, image_path, alt_text, sort_order, is_primary)`;

/**
 * All published products (for every caller — RLS applies the same rule at
 * the database), in curated order: featured first, then sort_order, then
 * newest. Products in inactive categories are hidden at the app level
 * (RLS does not yet enforce category activity — see the proposed
 * tightening migration); admins still manage those rows in the admin panel.
 */
export async function fetchCatalogProducts(): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .eq("categories.is_active", true)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load the product catalogue (${error.code ?? "unknown"}).`);
  }
  return (data ?? []).map(mapToProduct);
}

/**
 * Single published product by slug, or null — drafts 404 for every caller
 * (admin management of unpublished rows goes through
 * `fetchAdminProductById` below, never this function).
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT_WITH_GALLERY)
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("categories.is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load the product (${error.code ?? "unknown"}).`);
  }
  return data ? mapToProduct(data) : null;
}

/**
 * Products in one category (by slug), same visibility rules as the index.
 * The branch includes the category itself plus every active descendant, so
 * a parent category's page also lists products assigned to its
 * subcategories (subcategorised products stay reachable on their own
 * `/products/<slug>` routes too).
 */
export async function fetchProductsByCategory(slug: string): Promise<Product[]> {
  const all = await fetchCatalogProducts();
  const branch = await fetchCategoryBranchSlugs(slug);
  return all.filter((product) => branch.has(product.category));
}

/** Slug set for a category and all of its descendants (active rows only). */
async function fetchCategoryBranchSlugs(slug: string): Promise<Set<string>> {
  const categories = await fetchPublicCategories();
  const branch = new Set<string>();
  const childrenByParent = new Map<string, string[]>();
  let rootId: string | null = null;
  for (const category of categories) {
    if (category.slug === slug) rootId = category.id;
    if (category.parent_category_id) {
      const siblings = childrenByParent.get(category.parent_category_id) ?? [];
      siblings.push(category.id);
      childrenByParent.set(category.parent_category_id, siblings);
    }
  }
  if (!rootId) {
    // Unknown/inactive category: caller pages 404 before this, but stay safe.
    branch.add(slug);
    return branch;
  }
  const root = categories.find((category) => category.id === rootId);
  if (root) branch.add(root.slug);
  const queue = [rootId];
  while (queue.length > 0) {
    const parentId = queue.pop() as string;
    for (const childId of childrenByParent.get(parentId) ?? []) {
      const child = categories.find((category) => category.id === childId);
      if (child) {
        branch.add(child.slug);
        queue.push(childId);
      }
    }
  }
  return branch;
}

/** Same-category siblings for the detail page's "Related products" grid. */
export function relatedProducts(all: Product[], product: Product, limit = 4): Product[] {
  return all
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Admin-side queries (run with the admin's session; RLS allows all)  */
/* ------------------------------------------------------------------ */

export const ADMIN_PAGE_SIZE = 10;

export type AdminProductFilters = {
  q?: string;
  categoryId?: string;
  status?: "published" | "draft";
  page: number;
};

/** Escape LIKE wildcards so user input can't alter the pattern. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

/**
 * Paginated, filterable product list for the admin table.
 * Returns the page of rows plus the total matching count.
 */
export async function fetchAdminProducts(
  filters: AdminProductFilters,
): Promise<{ rows: AdminProductRow[]; total: number }> {
  const supabase = await getSupabaseServerClient();
  const from = (filters.page - 1) * ADMIN_PAGE_SIZE;

  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)", { count: "exact" });

  if (filters.q) query = query.ilike("name", `%${escapeLike(filters.q)}%`);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.status === "published") query = query.eq("is_published", true);
  if (filters.status === "draft") query = query.eq("is_published", false);

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);

  if (error) {
    throw new Error(`Unable to load products (${error.code ?? "unknown"}).`);
  }
  return { rows: (data ?? []) as AdminProductRow[], total: count ?? 0 };
}

/** Every category for admin forms and filters (including inactive), alphabetical. */
export async function fetchAdminCategories(): Promise<AdminCategoryRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, is_active, parent_category_id")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load categories (${error.code ?? "unknown"}).`);
  }
  return (data ?? []) as AdminCategoryRow[];
}

/**
 * Every category with its product count, for the admin categories table.
 * Includes inactive rows (admins see everything; RLS allows it).
 */
export type AdminCategoryListRow = AdminCategoryRow & {
  description: string;
  image_path: string | null;
  product_count: number;
};

export async function fetchAdminCategoryList(): Promise<AdminCategoryListRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load categories (${error.code ?? "unknown"}).`);
  }

  type RowWithCount = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_path: string | null;
    is_active: boolean;
    parent_category_id: string | null;
    products: { count: number }[] | null;
  };

  return ((data ?? []) as RowWithCount[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    image_path: row.image_path,
    is_active: row.is_active,
    parent_category_id: row.parent_category_id ?? null,
    product_count: row.products?.[0]?.count ?? 0,
  }));
}

/** Single category by id for the admin edit form. */
export async function fetchAdminCategoryById(
  id: string,
): Promise<AdminCategoryDetailRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load the category (${error.code ?? "unknown"}).`);
  }
  return (data as AdminCategoryDetailRow | null) ?? null;
}

/** Single product by id for the edit form (admins see drafts too). */
export async function fetchAdminProductById(id: string): Promise<AdminProductRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, categories(id, name, slug), product_images(id, image_path, alt_text, sort_order, is_primary)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load the product (${error.code ?? "unknown"}).`);
  }
  return (data as AdminProductRow | null) ?? null;
}

export type CatalogStats = {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalCategories: number;
  recentProducts: {
    id: string;
    name: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    categoryName: string | null;
  }[];
};

/** Dashboard counters + newest products, all straight from Postgres. */
export async function fetchCatalogStats(): Promise<CatalogStats> {
  const supabase = await getSupabaseServerClient();

  const [productsCount, publishedCount, categoriesCount, recent] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id, name, slug, is_published, created_at, categories(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (productsCount.error) {
    throw new Error(`Unable to load product statistics (${productsCount.error.code ?? "unknown"}).`);
  }
  if (publishedCount.error) {
    throw new Error(`Unable to load product statistics (${publishedCount.error.code ?? "unknown"}).`);
  }
  if (categoriesCount.error) {
    throw new Error(`Unable to load category statistics (${categoriesCount.error.code ?? "unknown"}).`);
  }
  if (recent.error) {
    throw new Error(`Unable to load recent products (${recent.error.code ?? "unknown"}).`);
  }

  const totalProducts = productsCount.count ?? 0;
  const publishedProducts = publishedCount.count ?? 0;

  type RecentRow = {
    id: string;
    name: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    categories: { name: string } | { name: string }[] | null;
  };
  const recentRows = (recent.data ?? []) as unknown as RecentRow[];

  return {
    totalProducts,
    publishedProducts,
    draftProducts: Math.max(0, totalProducts - publishedProducts),
    totalCategories: categoriesCount.count ?? 0,
    recentProducts: recentRows.map((row) => {
      // to-one join may surface as object or single-element array
      const category = Array.isArray(row.categories)
        ? row.categories[0]
        : row.categories;
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        is_published: row.is_published,
        created_at: row.created_at,
        categoryName: category?.name ?? null,
      };
    }),
  };
}

/** Featured published picks for the homepage (RLS still applies). */
export async function fetchFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .eq("is_featured", true)
    .eq("categories.is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load featured products (${error.code ?? "unknown"}).`);
  }
  return (data ?? []).map(mapToProduct);
}

/**
 * Active categories for public navigation, footer, catalogue chips, and
 * the /products tile grid. Cached ('use cache' + tag) and fetched with a
 * cookie-less anon client so the result is identical for every visitor
 * (RLS: is_active only — admins get no extra rows here on purpose).
 *
 * Seeded slugs keep their curated static copy/images when the DB row has
 * no image; admin-created categories fall back to neutral values. If the
 * database is unreachable (e.g. at build time), the static five-category
 * list is returned so the site still renders.
 */
export async function fetchPublicCategories(): Promise<PublicCategory[]> {
  "use cache";
  cacheTag("public-categories");
  cacheLife("hours");

  try {
    const { url, publishableKey } = getSupabasePublicEnv();
    const supabase = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_path, parent_category_id")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const staticMeta = productCategories.find((c) => c.slug === row.slug);
      const image = resolveProductImage(row.image_path) ?? staticMeta?.image;
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description || staticMeta?.description || "",
        href: categoryHref(row.slug),
        parent_category_id: row.parent_category_id ?? null,
        image,
        imageAlt: staticMeta?.imageAlt ?? (image ? row.name : undefined),
      };
    });
  } catch {
    // Static fallback mirrors the DB path: alphabetical by name.
    // The seeded five have no hierarchy — all top-level.
    return [...productCategories]
      .sort((a, b) => a.name.localeCompare(b.name, "en"))
      .map((category) => ({
        id: category.slug,
        slug: category.slug,
        name: category.name,
        description: category.description,
        href: category.href,
        parent_category_id: null,
        image: category.image,
        imageAlt: category.imageAlt,
      }));
  }
}

/** One active category by slug for public pages, or null. */
export async function fetchPublicCategoryBySlug(
  slug: string,
): Promise<PublicCategory | null> {
  const categories = await fetchPublicCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export { isStorageProductPath };
