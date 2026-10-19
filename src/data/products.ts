/**
 * Centralized, typed product catalog.
 *
 * IMPORTANT: All entries below are DEVELOPMENT DEMO DATA.
 * Names, brands, prices, and availability are placeholders until
 * real inventory is supplied. Nothing here should be presented
 * as genuine stock.
 */

export type ProductCategorySlug =
  | "pet-food"
  | "animal-feed"
  | "grooming"
  | "accessories"
  | "healthcare";

export type ProductAvailability = "in-stock" | "on-request" | "unavailable";

export type Product = {
  slug: string;
  name: string;
  /** Demo brand label — replace with verified brand names. */
  brand: string;
  category: ProductCategorySlug;
  description: string;
  /** Detailed copy for the product page. */
  details: string;
  /** Display price string, e.g. "PKR 1,200". Demo values only. */
  price: string;
  /** Numeric price for sorting (demo values). */
  priceValue: number;
  size?: string;
  availability: ProductAvailability;
  image: string;
  imageAlt: string;
  /** Always true for current entries — flag for demo inventory. */
  demo: true;
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

export const products: Product[] = [
  // —— Pet Food ——
  {
    slug: "adult-dog-dry-food-3kg",
    name: "Adult Dog Dry Food — 3 kg",
    brand: "Demo Brand",
    category: "pet-food",
    description:
      "Complete dry food formulation for adult dogs as part of a balanced diet.",
    details:
      "Development demo listing. Replace with verified packaging details, guaranteed analysis, and feeding guidelines once real inventory is confirmed.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "3 kg",
    availability: "on-request",
    image: "/images/dog-food-bowl.jpg",
    imageAlt: "Dry dog food served in a ceramic bowl",
    demo: true,
  },
  {
    slug: "puppy-dry-food-2kg",
    name: "Puppy Dry Food — 2 kg",
    brand: "Demo Brand",
    category: "pet-food",
    description:
      "Smaller-kibble dry food concept for growing puppies, offered as a demo listing.",
    details:
      "Development demo listing. Product name, composition, and price await confirmation from actual inventory.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "2 kg",
    availability: "on-request",
    image: "/images/kibble.jpg",
    imageAlt: "Close-up of dry pet food kibble",
    demo: true,
  },
  {
    slug: "cat-dry-food-1-5kg",
    name: "Cat Dry Food — 1.5 kg",
    brand: "Demo Brand",
    category: "pet-food",
    description:
      "Demo catalog entry for everyday cat dry food in a resealable pack.",
    details:
      "Development demo listing. Replace with the verified product, weight, and price before launch.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "1.5 kg",
    availability: "unavailable",
    image: "/images/dog-bowl-white.jpg",
    imageAlt: "White pet food bowl on a light surface",
    demo: true,
  },
  {
    slug: "dental-chews-assorted",
    name: "Dental Chews — Assorted",
    brand: "Demo Brand",
    category: "pet-food",
    description:
      "Placeholder listing for dental chew treats in assorted sizes.",
    details:
      "Development demo listing. Verify brand, pack size, and availability before publishing.",
    price: "PKR 0,000",
    priceValue: 0,
    availability: "on-request",
    image: "/images/dog-eating.jpg",
    imageAlt: "Brown and white dog eating from a bowl",
    demo: true,
  },

  // —— Animal Feed ——
  {
    slug: "dairy-cattle-ration-50kg",
    name: "Dairy Cattle Ration — 50 kg",
    brand: "Demo Brand",
    category: "animal-feed",
    description:
      "Demo entry for a balanced dairy cattle ration sack for farm use.",
    details:
      "Development demo listing. Feed composition, batch details, and price to be confirmed with the supplier.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "50 kg",
    availability: "on-request",
    image: "/images/cattle-feed.jpg",
    imageAlt: "Cattle eating feed from a pen",
    demo: true,
  },
  {
    slug: "calf-starter-feed-25kg",
    name: "Calf Starter Feed — 25 kg",
    brand: "Demo Brand",
    category: "animal-feed",
    description:
      "Placeholder listing for calf starter feed for young stock on farm.",
    details:
      "Development demo listing. Replace with verified feed tag information before launch.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "25 kg",
    availability: "on-request",
    image: "/images/cows-barn.jpg",
    imageAlt: "Cows eating together inside a barn",
    demo: true,
  },
  {
    slug: "mineral-mix-supplement-10kg",
    name: "Mineral Mix Supplement — 10 kg",
    brand: "Demo Brand",
    category: "animal-feed",
    description:
      "Demo listing for a trace-mineral mix used as part of herd nutrition planning.",
    details:
      "Development demo listing. Mineral profile and feeding rate require supplier confirmation.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "10 kg",
    availability: "unavailable",
    image: "/images/livestock-hero.jpg",
    imageAlt: "Herd of buffalo resting on green pasture",
    demo: true,
  },
  {
    slug: "poultry-layer-feed-20kg",
    name: "Poultry Layer Feed — 20 kg",
    brand: "Demo Brand",
    category: "animal-feed",
    description:
      "Placeholder listing for layer feed for laying hens in a farm setting.",
    details:
      "Development demo listing. Confirm formulation and pricing with the supplier.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "20 kg",
    availability: "on-request",
    image: "/images/cattle-herd.jpg",
    imageAlt: "Herd of cattle grazing in an open field",
    demo: true,
  },

  // —— Grooming ——
  {
    slug: "gentle-pet-shampoo-400ml",
    name: "Gentle Pet Shampoo — 400 ml",
    brand: "Demo Brand",
    category: "grooming",
    description:
      "Demo entry for a mild everyday shampoo for regular coat cleaning.",
    details:
      "Development demo listing. Ingredients, brand, and price pending verified inventory.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "400 ml",
    availability: "in-stock",
    image: "/images/dog-grooming.jpg",
    imageAlt: "Dog being washed during grooming",
    demo: true,
  },
  {
    slug: "slicker-brush-medium",
    name: "Slicker Brush — Medium",
    brand: "Demo Brand",
    category: "grooming",
    description:
      "Placeholder listing for a medium slicker brush for routine de-shedding.",
    details:
      "Development demo listing. Replace with verified product photography and specifications.",
    price: "PKR 0,000",
    priceValue: 0,
    availability: "in-stock",
    image: "/images/dog-hose.jpg",
    imageAlt: "Dog being rinsed with water outdoors",
    demo: true,
  },
  {
    slug: "coat-conditioner-spray-250ml",
    name: "Coat Conditioner Spray — 250 ml",
    brand: "Demo Brand",
    category: "grooming",
    description:
      "Demo listing for a leave-in coat conditioner spray after bathing.",
    details:
      "Development demo listing. Confirm brand and usage instructions before publishing.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "250 ml",
    availability: "on-request",
    image: "/images/dog-red-collar.jpg",
    imageAlt: "Dog wearing a collar, coat in good condition",
    demo: true,
  },
  {
    slug: "nail-clipper-set",
    name: "Nail Clipper Set",
    brand: "Demo Brand",
    category: "grooming",
    description:
      "Placeholder listing for a basic nail care set for dogs and cats.",
    details:
      "Development demo listing. Product details to be verified with the supplier.",
    price: "PKR 0,000",
    priceValue: 0,
    availability: "unavailable",
    image: "/images/cat.jpg",
    imageAlt: "Cat resting, well-groomed coat",
    demo: true,
  },

  // —— Accessories ——
  {
    slug: "nylon-dog-collar-adjustable",
    name: "Nylon Dog Collar — Adjustable",
    brand: "Demo Brand",
    category: "accessories",
    description:
      "Demo entry for an adjustable everyday collar with a quick-release buckle.",
    details:
      "Development demo listing. Sizes, colours, and price await real inventory details.",
    price: "PKR 0,000",
    priceValue: 0,
    availability: "in-stock",
    image: "/images/dog-collar-leash.jpg",
    imageAlt: "Golden retriever wearing a collar and leash",
    demo: true,
  },
  {
    slug: "padded-dog-harness",
    name: "Padded Dog Harness",
    brand: "Demo Brand",
    category: "accessories",
    description:
      "Placeholder listing for a padded harness for controlled daily walks.",
    details:
      "Development demo listing. Replace with verified sizing chart and pricing.",
    price: "PKR 0,000",
    priceValue: 0,
    availability: "on-request",
    image: "/images/dog-harness.jpg",
    imageAlt: "Dog wearing a padded harness on a leash",
    demo: true,
  },
  {
    slug: "stainless-feeding-bowl",
    name: "Stainless Feeding Bowl",
    brand: "Demo Brand",
    category: "accessories",
    description:
      "Demo listing for a durable stainless feeding bowl for daily use.",
    details:
      "Development demo listing. Capacity and price to be confirmed.",
    price: "PKR 0,000",
    priceValue: 0,
    availability: "in-stock",
    image: "/images/dog-bed-bowl.jpg",
    imageAlt: "Dog resting beside a food bowl in a bed",
    demo: true,
  },
  {
    slug: "braided-leash-1-5m",
    name: "Braided Leash — 1.5 m",
    brand: "Demo Brand",
    category: "accessories",
    description:
      "Placeholder listing for a everyday braided lead with a metal clip.",
    details:
      "Development demo listing. Verify material and length before publishing.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "1.5 m",
    availability: "on-request",
    image: "/images/dog-collar-leash.jpg",
    imageAlt: "Dog on a leash during a walk",
    demo: true,
  },

  // —— Healthcare ——
  {
    slug: "multivitamin-drops-100ml",
    name: "Multivitamin Drops — 100 ml",
    brand: "Demo Brand",
    category: "healthcare",
    description:
      "Demo listing for a supportive multivitamin product for companion animals. Discuss use with your veterinarian.",
    details:
      "Development demo listing. Administration guidance, brand, and price require verification before launch.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "100 ml",
    availability: "on-request",
    image: "/images/medicine-bottle.jpg",
    imageAlt: "Bottle of capsules on a clean surface",
    demo: true,
  },
  {
    slug: "ear-cleaning-solution-60ml",
    name: "Ear Cleaning Solution — 60 ml",
    brand: "Demo Brand",
    category: "healthcare",
    description:
      "Placeholder listing for routine ear-cleaning solution for dogs and cats.",
    details:
      "Development demo listing. Not a treatment claim — confirm suitability with your veterinarian.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "60 ml",
    availability: "in-stock",
    image: "/images/medicine-closeup.jpg",
    imageAlt: "Close-up of a medicine bottle",
    demo: true,
  },
  {
    slug: "wound-care-spray-120ml",
    name: "Wound Care Spray — 120 ml",
    brand: "Demo Brand",
    category: "healthcare",
    description:
      "Demo entry for an external wound-care product for minor grazing. Veterinary advice recommended.",
    details:
      "Development demo listing. Replace with the verified product label and instructions.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "120 ml",
    availability: "unavailable",
    image: "/images/medicine-table.jpg",
    imageAlt: "Medicine bottle on a wooden table",
    demo: true,
  },
  {
    slug: "probiotic-powder-pets-200g",
    name: "Probiotic Powder for Pets — 200 g",
    brand: "Demo Brand",
    category: "healthcare",
    description:
      "Placeholder listing for a supportive probiotic powder. Confirm suitability with your veterinarian.",
    details:
      "Development demo listing. Strain information and feeding guidance pending verification.",
    price: "PKR 0,000",
    priceValue: 0,
    size: "200 g",
    availability: "on-request",
    image: "/images/white-bottle.jpg",
    imageAlt: "Plain white supplement bottle",
    demo: true,
  },
];

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return productCategories.find((category) => category.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(slug: ProductCategorySlug): Product[] {
  return products.filter((product) => product.category === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, limit);
}

export const availabilityLabel: Record<ProductAvailability, string> = {
  "in-stock": "In stock",
  "on-request": "Available on request",
  unavailable: "Currently unavailable",
};

export type ProductSort = "featured" | "price-asc" | "price-desc" | "name";

export function sortProducts(
  list: Product[],
  sort: ProductSort,
): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceValue - b.priceValue);
    case "price-desc":
      return copy.sort((a, b) => b.priceValue - a.priceValue);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return copy;
  }
}
