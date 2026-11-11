/**
 * Product catalogue — shared types, category metadata, and pure helpers
 * (search, sorting, labels) used by both server pages and client
 * components.
 *
 * Runtime product data comes from Supabase via `src/lib/catalog.ts`
 * (server-side fetches honouring RLS). Components must never hold their
 * own hardcoded product records.
 */

export type ProductCategorySlug =
  | "pet-food"
  | "animal-feed"
  | "grooming"
  | "accessories"
  | "healthcare";

/**
 * Stock status — only set once the practice has verified it.
 * Absent means "not stated", which is never rendered as a claim.
 */
export type ProductAvailability = "in-stock" | "on-request" | "unavailable";

export type Product = {
  slug: string;
  name: string;
  /** Verified brand name. Omitted when unconfirmed. */
  brand?: string;
  category: ProductCategorySlug;
  /** Short factual summary of the listing. */
  description: string;
  /** Longer factual copy for the product detail page. */
  details?: string;
  /** Verified price the customer pays, e.g. "PKR 1,200". Omit until supplied — never faked. */
  price?: string;
  /** Numeric price the customer pays; drives price sorting. Only meaningful when `price` exists. */
  priceValue?: number;
  /** Original price before a discount, rendered struck through. Only set when strictly higher than `price`. */
  comparePrice?: string;
  /** Whole-percent saving against `comparePrice` (>= 1). Derived from the two prices — never typed by hand. */
  discountPercent?: number;
  /** Verified pack size, e.g. "3 kg". Omit when unconfirmed. */
  size?: string;
  /** Verified availability. Omit when unconfirmed. */
  availability?: ProductAvailability;
  /** Product photography. Omitted entries fall back to a neutral panel. */
  image?: string;
  imageAlt?: string;
  /**
   * Full gallery for the detail page, in display order (primary flagged).
   * Only populated by the detail-page fetch; card/list queries leave it
   * unset and rely on `image` (the synced primary) alone.
   */
  images?: ProductGalleryImage[];
};

/** One image in a product's public gallery. */
export type ProductGalleryImage = {
  src: string;
  alt: string;
  isPrimary: boolean;
};

export type ProductCategory = {
  slug: ProductCategorySlug;
  name: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
};

export const productCategories: ProductCategory[] = [
  {
    slug: "pet-food",
    name: "Pet Food",
    description:
      "Dry food, treats, and everyday nutrition for dogs and cats.",
    href: "/products/pet-food",
    image: "/images/dog-food-bowl.jpg",
    imageAlt: "Dry pet food served in a clean bowl",
  },
  {
    slug: "animal-feed",
    name: "Animal Feed",
    description:
      "Feed and nutritional supplements for cattle, buffalo, and small livestock.",
    href: "/products/animal-feed",
    image: "/images/cattle-feed.jpg",
    imageAlt: "Cattle eating feed at a farm pen",
  },
  {
    slug: "grooming",
    name: "Grooming Products",
    description:
      "Shampoos, brushes, and coat-care essentials for regular grooming.",
    href: "/products/grooming",
    image: "/images/dog-grooming.jpg",
    imageAlt: "Dog being bathed during grooming",
  },
  {
    slug: "accessories",
    name: "Pet Accessories",
    description:
      "Collars, leashes, bowls, and everyday handling accessories.",
    href: "/products/accessories",
    image: "/images/dog-collar-leash.jpg",
    imageAlt: "Dog wearing a collar and leash",
  },
  {
    slug: "healthcare",
    name: "Animal Healthcare Products",
    description:
      "Supportive care products discussed with your veterinarian before use.",
    href: "/products/healthcare",
    image: "/images/medicine-bottle.jpg",
    imageAlt: "Healthcare product bottle on a clean surface",
  },
];

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return productCategories.find((category) => category.slug === slug);
}

export const availabilityLabel: Record<ProductAvailability, string> = {
  "in-stock": "In stock",
  "on-request": "Available on request",
  unavailable: "Currently unavailable",
};

export type ProductSort = "featured" | "price-asc" | "price-desc" | "name";

/** Items without a verified price always sort after priced items. */
function comparePrice(a: Product, b: Product, direction: 1 | -1): number {
  const aValue = a.priceValue;
  const bValue = b.priceValue;
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;
  return direction * (aValue - bValue);
}

export function sortProducts(
  list: Product[],
  sort: ProductSort,
): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => comparePrice(a, b, 1));
    case "price-desc":
      return copy.sort((a, b) => comparePrice(a, b, -1));
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return copy;
  }
}

/**
 * Search + sort over a single dataset. Category filtering happens upstream
 * (route → `fetchProductsByCategory`), so search, sorting, and result
 * counts always operate on the same records. `categoryNames` maps DB
 * category slugs → display names so search also matches admin-created
 * categories (static five fall back to `getCategoryBySlug`).
 */
export function queryProducts(
  list: Product[],
  options: {
    query?: string;
    sort?: ProductSort;
    categoryNames?: Record<string, string>;
  } = {},
): Product[] {
  const term = options.query?.trim().toLowerCase();
  const matched = term
    ? list.filter((product) => {
        const haystack = [
          product.name,
          product.brand ?? "",
          product.description,
          product.size ?? "",
          options.categoryNames?.[product.category] ??
            getCategoryBySlug(product.category)?.name ??
            "",
        ];
        return haystack.some((value) => value.toLowerCase().includes(term));
      })
    : [...list];
  return sortProducts(matched, options.sort ?? "featured");
}
