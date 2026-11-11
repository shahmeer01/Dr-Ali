/**
 * Pure parsing + validation for the admin product form.
 *
 * Kept free of server-only imports (next/headers, Supabase, …) so the
 * same rules run in the save server action on submit and can be exercised
 * directly outside a request. The action re-checks the caller's session
 * and admin role before ever calling into this module's consumer.
 */

import { slugifyProductName } from "./product-shared";

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const AVAILABILITY_VALUES = ["in-stock", "on-request", "unavailable"] as const;

export function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function parseOptionalNumber(
  raw: FormDataEntryValue | null,
): number | null | "invalid" {
  const text = emptyToNull(raw);
  if (text == null) return null;
  const parsed = Number(text.replace(/,/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) return "invalid";
  return Math.round(parsed * 100) / 100;
}

export type ParsedProductFields = {
  values: {
    name: string;
    slug: string;
    brand: string | null;
    category_id: string;
    description: string;
    details: string | null;
    price: number | null;
    compare_price: number | null;
    size: string | null;
    availability: string | null;
    image_alt: string | null;
    is_featured: boolean;
    is_published: boolean;
  };
  fieldErrors: Record<string, string>;
};

/* ------------------------------------------------------------------ */
/* Product gallery (multiple images per product)                       */
/* ------------------------------------------------------------------ */

/** Hard cap on gallery size (existing + new images after a save). */
export const MAX_GALLERY_IMAGES = 10;

/**
 * One entry of the gallery plan the admin form submits as JSON.
 * Array order is the desired gallery order (sort_order = index).
 *  * `existing` — a `product_images` row that already belongs to the product;
 *  * `legacy`   — the historical `products.image_path` image not yet
 *                 materialised as a `product_images` row (the action
 *                 resolves the path server-side; the client never sends it);
 *  * `new`      — a file from the `images` FormData field, matched by order.
 */
export type GalleryPlanEntry = {
  kind: "existing" | "legacy" | "new";
  id: string | null;
  alt: string;
  isPrimary: boolean;
};

export type ParsedGalleryPlan = {
  plan: GalleryPlanEntry[];
  fieldError?: string;
};

/**
 * Validate the `gallery_plan` JSON hidden field. Structural checks only —
 * ownership of `existing` ids and the legacy path are verified in the save
 * action against the database (the client can never inject a storage path).
 * When no entry is flagged primary but the gallery is non-empty, the first
 * entry becomes primary so cards always have an image to show.
 */
export function parseGalleryPlan(raw: FormDataEntryValue | null): ParsedGalleryPlan {
  const invalid: ParsedGalleryPlan = {
    plan: [],
    fieldError: "The image gallery state is invalid — reload the page and try again.",
  };

  if (raw == null || typeof raw !== "string") return invalid;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return invalid;
  }
  if (!Array.isArray(parsed)) return invalid;

  const plan: GalleryPlanEntry[] = [];
  let primaries = 0;

  for (const item of parsed) {
    if (typeof item !== "object" || item === null) return invalid;
    const record = item as Record<string, unknown>;

    const kind = record.kind;
    if (kind !== "existing" && kind !== "legacy" && kind !== "new") return invalid;

    const alt = typeof record.alt === "string" ? record.alt.trim() : "";
    if (alt.length > 200) {
      return { plan: [], fieldError: "Keep each image's alt text under 200 characters." };
    }

    let id: string | null = null;
    if (kind === "existing") {
      if (typeof record.id !== "string" || !UUID_RE.test(record.id)) return invalid;
      id = record.id;
    }

    const isPrimary = record.isPrimary === true;
    if (isPrimary) primaries += 1;

    plan.push({ kind, id, alt, isPrimary });
  }

  if (plan.length > MAX_GALLERY_IMAGES) {
    return {
      plan: [],
      fieldError: `Keep the gallery to ${MAX_GALLERY_IMAGES} images or fewer.`,
    };
  }
  if (primaries > 1) {
    return { plan: [], fieldError: "Choose exactly one primary image." };
  }
  if (plan.length > 0 && primaries === 0) plan[0].isPrimary = true;

  return { plan };
}

/**
 * Validate the product form's text/number/select/checkbox fields.
 *
 * Pricing rules: both prices are optional, but a compare price without a
 * price is rejected, and a compare price must be strictly higher than the
 * price — no fake (0%) discounts ever reach the database.
 */
export function parseProductFields(formData: FormData): ParsedProductFields {
  const fieldErrors: Record<string, string> = {};

  const name = emptyToNull(formData.get("name"));
  if (!name) fieldErrors.name = "Product name is required.";
  else if (name.length > 200) fieldErrors.name = "Keep the name under 200 characters.";

  const rawSlug = emptyToNull(formData.get("slug"));
  const slug = rawSlug ?? (name ? slugifyProductName(name) : "");
  if (!slug) fieldErrors.slug = "A slug is required.";
  else if (!SLUG_RE.test(slug)) {
    fieldErrors.slug = "Use lowercase letters, numbers, and single hyphens only.";
  } else if (slug.length > 100) fieldErrors.slug = "Keep the slug under 100 characters.";

  const brand = emptyToNull(formData.get("brand"));
  if (brand && brand.length > 120) fieldErrors.brand = "Keep the brand under 120 characters.";

  const category_id = emptyToNull(formData.get("category_id")) ?? "";
  if (!category_id) fieldErrors.category_id = "Choose a category.";
  else if (!UUID_RE.test(category_id)) fieldErrors.category_id = "Invalid category.";

  const description = emptyToNull(formData.get("description"));
  if (!description) fieldErrors.description = "A description is required.";
  else if (description.length > 2000) {
    fieldErrors.description = "Keep the description under 2,000 characters.";
  }

  const details = emptyToNull(formData.get("details"));
  if (details && details.length > 10000) {
    fieldErrors.details = "Keep the details under 10,000 characters.";
  }

  const priceRaw = parseOptionalNumber(formData.get("price"));
  let price: number | null = null;
  if (priceRaw === "invalid") fieldErrors.price = "Enter a valid price (0 or more).";
  else price = priceRaw;

  const compareRaw = parseOptionalNumber(formData.get("compare_price"));
  let compare_price: number | null = null;
  if (compareRaw === "invalid") {
    fieldErrors.compare_price = "Enter a valid compare price (0 or more).";
  } else compare_price = compareRaw;

  if (compare_price != null) {
    if (price == null) {
      fieldErrors.compare_price = "A compare price needs a price as well.";
    } else if (compare_price <= price) {
      fieldErrors.compare_price =
        "The compare price must be higher than the price — no fake discounts.";
    }
  }

  const size = emptyToNull(formData.get("size"));
  if (size && size.length > 60) fieldErrors.size = "Keep the pack size under 60 characters.";

  const availabilityRaw = emptyToNull(formData.get("availability"));
  let availability: string | null = null;
  if (availabilityRaw) {
    if ((AVAILABILITY_VALUES as readonly string[]).includes(availabilityRaw)) {
      availability = availabilityRaw;
    } else {
      fieldErrors.availability = "Choose a valid availability option.";
    }
  }

  const image_alt = emptyToNull(formData.get("image_alt"));
  if (image_alt && image_alt.length > 200) {
    fieldErrors.image_alt = "Keep the alt text under 200 characters.";
  }

  return {
    values: {
      name: name ?? "",
      slug,
      brand,
      category_id,
      description: description ?? "",
      details,
      price,
      compare_price,
      size,
      availability,
      image_alt,
      is_featured: formData.get("is_featured") === "on",
      is_published: formData.get("is_published") === "on",
    },
    fieldErrors,
  };
}
