/**
 * Isomorphic product helpers shared by server and client code.
 *
 * This module must stay free of server-only imports (next/headers,
 * service credentials, …) — the admin form imports it in the browser.
 */

export const PRODUCT_IMAGES_BUCKET = "product-images";

/** Object paths the upload flows generate: products/<uuid>.<ext> or categories/<uuid>.<ext> */
const STORAGE_OBJECT_PATH = /^(products|categories)\/[0-9a-f-]{36}\.[a-z0-9]+$/;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  /** NULL = top-level; otherwise the parent category id. */
  parent_category_id: string | null;
};

/** Full category row for the admin edit form. */
export type AdminCategoryDetailRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_path: string | null;
  is_active: boolean;
  parent_category_id: string | null;
  created_at: string;
  updated_at: string;
};

/** Category as rendered in public navigation, footer, and catalogue chips. */
export type PublicCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  /** NULL = top-level; otherwise the parent category id (hierarchy nav). */
  parent_category_id: string | null;
  image?: string;
  imageAlt?: string;
};

/**
 * Public route for a category slug: always `/products/<slug>`. The five
 * seeded slugs resolve via their static route files; any other
 * (admin-created) active category resolves through the dynamic
 * `/products/[slug]` route (product first, then category, else 404).
 */
export function categoryHref(slug: string): string {
  return `/products/${slug}`;
}

/** One row of the product gallery (`product_images`). */
export type AdminProductImageRow = {
  id: string;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category_id: string;
  description: string;
  details: string | null;
  price: number | string | null;
  compare_price: number | string | null;
  /** Legacy display string from the old pricing model — read-only fallback. */
  price_text: string | null;
  size: string | null;
  availability: string | null;
  /** Primary image pointer — kept in sync with the primary gallery row. */
  image_path: string | null;
  image_alt: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  categories: { id: string; name: string; slug: string } | null;
  /** Gallery rows in display order (empty for legacy single-image products). */
  product_images?: AdminProductImageRow[];
};

export function isStorageProductPath(path: string): boolean {
  return STORAGE_OBJECT_PATH.test(path);
}

/**
 * Turn a stored image reference into something the site can render:
 *   * `/images/...` or full URLs pass through (legacy local assets);
 *   * `products/<uuid>.<ext>` becomes the public Storage object URL;
 *   * anything else is dropped (never rendered, never trusted).
 */
export function resolveProductImage(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (
    path.startsWith("/") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }
  if (isStorageProductPath(path)) {
    return `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path}`;
  }
  return undefined;
}

/** Kebab-case slug from a product name (client + server preview). */
export function slugifyProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/* ------------------------------------------------------------------ */
/* Pricing — single source of truth for every price display on the     */
/* site (public catalogue mapping, admin table, forms previewing rows) */
/* ------------------------------------------------------------------ */

/** Format a confirmed amount for display: "PKR 1,200". */
export function formatPkr(value: number): string {
  return `PKR ${value.toLocaleString("en-US")}`;
}

/** Coerce a numeric column (number, numeric-as-string, or null) to a finite number. */
function toFiniteNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export type PricedProductRow = {
  price: number | string | null;
  compare_price?: number | string | null;
  /** Legacy display string from the old pricing model — read-only fallback. */
  price_text?: string | null;
};

export type ResolvedProductPrice = {
  /** Selling price, else the legacy price_text fallback; undefined when unconfirmed. */
  price?: string;
  /** Numeric selling price; drives price sorting. Only set when `price` is numeric. */
  priceValue?: number;
  /** Original price, formatted — only set when strictly higher than `price`. */
  comparePrice?: string;
  /** Whole-percent saving (>= 1), derived — never typed by hand. */
  discountPercent?: number;
};

/**
 * Resolve a stored row into the values every surface renders:
 *   * `price` is the selling price; `price_text` is only a fallback when no
 *     numeric price is confirmed (legacy rows like "Confirmed on WhatsApp");
 *   * `compare_price` counts only when strictly above `price` — DB + action
 *     validation enforce this, re-checked here so a bad row can never render
 *     as a fake (0%) discount;
 *   * the discount is floored to whole percent and only claimed at >= 1%.
 */
export function resolveProductPrice(row: PricedProductRow): ResolvedProductPrice {
  const price = toFiniteNumber(row.price);
  const compare = toFiniteNumber(row.compare_price);

  const resolved: ResolvedProductPrice = {};
  if (price != null) {
    resolved.price = formatPkr(price);
    resolved.priceValue = price;
  } else if (row.price_text) {
    resolved.price = row.price_text;
  }

  if (price != null && compare != null && compare > price) {
    resolved.comparePrice = formatPkr(compare);
    const percent = Math.floor(((compare - price) / compare) * 100);
    if (percent >= 1) resolved.discountPercent = percent;
  }
  return resolved;
}
