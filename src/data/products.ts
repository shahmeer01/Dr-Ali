/**
 * Product catalogue — the single typed data source for every product listing
 * on the site (category routes, the /products index, the homepage picks, and
 * product detail pages).
 *
 * Integration boundary
 * --------------------
 * `inventory` below is the only place product records enter the application.
 * It is intentionally empty: no verified inventory (names, brands, pack
 * sizes, prices, stock status, photography) has been supplied yet, so
 * nothing is published as a listing. The UI renders a safe "products are
 * being updated" state instead.
 *
 * When a backend, CMS, ERP, or supplier feed becomes available, resolve it
 * here (server-side fetch / SDK call) and map the response onto the
 * `Product` type — the exported accessors stay unchanged and every consumer
 * (search, filtering, sorting, counts) keeps reading the same dataset.
 * Components must never hold their own hardcoded product records.
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
  /** Verified display price, e.g. "PKR 1,200". Omit until supplied — never faked. */
  price?: string;
  /** Numeric price used for sorting; only meaningful when `price` exists. */
  priceValue?: number;
  /** Verified pack size, e.g. "3 kg". Omit when unconfirmed. */
  size?: string;
  /** Verified availability. Omit when unconfirmed. */
  availability?: ProductAvailability;
  /** Product photography. Omitted entries fall back to a neutral panel. */
  image?: string;
  imageAlt?: string;
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

/**
 * Verified inventory feed. Empty until real product data is connected —
 * see the module docblock for how to plug a source in.
 */
const inventory: readonly Product[] = [];

/**
 * Read-only accessors over `inventory`. This object is the integration
 * boundary: swapping the static list for an API/CMS response only touches
 * this module.
 */
export const productSource = {
  /** All verified listings, in curated order. */
  list(): readonly Product[] {
    return inventory;
  },
  bySlug(slug: string): Product | undefined {
    return inventory.find((product) => product.slug === slug);
  },
  byCategory(slug: ProductCategorySlug): Product[] {
    return inventory.filter((product) => product.category === slug);
  },
  related(product: Product, limit = 4): Product[] {
    return inventory
      .filter((item) => item.category === product.category && item.slug !== product.slug)
      .slice(0, limit);
  },
} as const;

/** Snapshot of the inventory used by pages and the client catalogue. */
export const products: Product[] = [...productSource.list()];

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return productCategories.find((category) => category.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return productSource.bySlug(slug);
}

export function getProductsByCategory(slug: ProductCategorySlug): Product[] {
  return productSource.byCategory(slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return productSource.related(product, limit);
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
 * (route → `getProductsByCategory`), so search, sorting, and result counts
 * always operate on the same records.
 */
export function queryProducts(
  list: Product[],
  options: { query?: string; sort?: ProductSort } = {},
): Product[] {
  const term = options.query?.trim().toLowerCase();
  const matched = term
    ? list.filter((product) => {
        const haystack = [
          product.name,
          product.brand ?? "",
          product.description,
          product.size ?? "",
          getCategoryBySlug(product.category)?.name ?? "",
        ];
        return haystack.some((value) => value.toLowerCase().includes(term));
      })
    : [...list];
  return sortProducts(matched, options.sort ?? "featured");
}
