"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle, PackageOpen, Phone, Search, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/commerce/ProductCard";
import { StatePanel } from "@/components/commerce/CatalogueStates";
import { PRODUCT_GRID_CLASS } from "@/components/commerce/productGrid";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { PublicCategory } from "@/lib/product-shared";
import { waLink } from "@/lib/whatsapp";
import {
  queryProducts,
  type Product,
  type ProductSort,
} from "@/data/products";

type ProductCatalogProps = {
  /** Products already scoped to the route's category (same data source). */
  products: Product[];
  /** Active categories for the filter chips (DB-driven; falls back to the
   *  seeded five via the parent fetch). */
  categories: PublicCategory[];
  /** Preset category from the route; "all" marks the All Products chip. */
  activeCategory?: string;
};

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
];

const chipBase =
  "inline-flex h-10 items-center whitespace-nowrap rounded-control px-3.5 text-[13.5px] font-medium leading-none transition-colors duration-[180ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

const chipActive = cn(chipBase, "bg-forest text-white");

const chipIdle = cn(
  chipBase,
  "border border-border-subtle bg-white text-charcoal hover:border-forest/40 hover:text-forest",
);

/**
 * Shared catalogue body: route-based category navigation (scrollable
 * chips on mobile, wrapped rows on desktop), search + sort over one
 * dataset, a live result count, and context-aware states — empty
 * category, empty search results — kept visually distinct from one
 * another (error/loading states are handled outside this component).
 */
export function ProductCatalog({
  products,
  categories,
  activeCategory = "all",
}: ProductCatalogProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProductSort>("featured");
  const chipsRef = useRef<HTMLUListElement>(null);

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.slug, category.name])),
    [categories],
  );

  const filtered = useMemo(
    () => queryProducts(products, { query, sort, categoryNames }),
    [products, query, sort, categoryNames],
  );

  const catalogueEmpty = products.length === 0;
  const activeCategoryMeta =
    activeCategory === "all"
      ? undefined
      : categories.find((category) => category.slug === activeCategory);

  // On mobile the chip row scrolls horizontally — keep the active chip in
  // view (centred when it overflows) whenever the route changes.
  useEffect(() => {
    const row = chipsRef.current;
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const active = row.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) return;
    row.scrollLeft = Math.max(
      0,
      active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2,
    );
  }, [activeCategory]);

  const enquiryMessage = `Hello Dr. Ali Ahmad, I would like to ask about ${
    activeCategoryMeta ? activeCategoryMeta.name : "the products in your catalogue"
  }. Please share current availability, pack sizes, and pricing.`;

  return (
    <div>
      {/* Category navigation — route based, one chip per catalogue */}
      <nav aria-label="Product categories" className="mb-6">
        <ul
          ref={chipsRef}
          className="-mx-5 flex items-center gap-2.5 overflow-x-auto px-5 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <li className="shrink-0">
            {activeCategory === "all" ? (
              <span aria-current="page" className={chipActive}>
                All Products
              </span>
            ) : (
              <Link href="/products" className={chipIdle}>
                All Products
              </Link>
            )}
          </li>
          {categories.map((category) => (
            <li key={category.slug} className="shrink-0">
              <Link
                href={category.href}
                aria-current={
                  category.slug === activeCategory ? "page" : undefined
                }
                className={cn(
                  category.slug === activeCategory ? chipActive : chipIdle,
                )}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Search + sort + count — hidden when the category itself is empty
          (nothing to search); the empty state below carries the message. */}
      {!catalogueEmpty ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="product-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products…"
                className="h-10 w-full rounded-control border border-border-subtle bg-white pl-10 pr-9 text-[14.5px] text-charcoal transition-colors duration-[180ms] placeholder:text-muted focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-control text-muted transition-colors hover:bg-charcoal/[0.05] hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {/* Label + select on one baseline; the select hides the native
                arrow and uses a chevron inset from the right edge so text
                and indicator never overlap. */}
            <div className="flex items-center gap-3">
              <label htmlFor="product-sort" className="text-[14px] text-muted">
                Sort by
              </label>
              {/* Plain positioning context — the select's fixed width sizes
                  the wrapper, so the chevron is always inset from the
                  field's own right edge (no % -width sizing chain). */}
              <div className="relative">
                <select
                  id="product-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as ProductSort)}
                  className="h-10 w-[220px] max-w-full appearance-none rounded-control border border-border-subtle bg-white pl-3.5 pr-9 text-[14.5px] text-charcoal transition-colors duration-[180ms] focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Live result count — derived from the filtered dataset */}
          <p className="mt-5 text-[14px] leading-6 text-muted" role="status">
            {filtered.length === 0
              ? "No products match your search."
              : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`}
          </p>
        </>
      ) : null}

      {catalogueEmpty ? (
        <StatePanel
          icon={<PackageOpen className="h-5 w-5" aria-hidden="true" />}
          title={
            activeCategoryMeta
              ? `No products in ${activeCategoryMeta.name} yet`
              : "No products published yet"
          }
          body={
            activeCategoryMeta
              ? `Listings for ${activeCategoryMeta.name} haven't been published yet. Browse the full catalogue, or message the practice — we'll confirm what's available.`
              : "The catalogue is being prepared. Message the practice to check current availability, pack sizes, and pricing."
          }
        >
          <Button
            href={waLink(enquiryMessage)}
            size="md"
            variant="primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Enquire on WhatsApp
          </Button>
          <Button href={siteConfig.phoneHref} size="md" variant="secondary">
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call the practice
          </Button>
          {activeCategory !== "all" ? (
            <Button href="/products" size="md" variant="ghost">
              Browse all products
            </Button>
          ) : null}
        </StatePanel>
      ) : filtered.length === 0 ? (
        <StatePanel
          variant="soft"
          icon={<SearchX className="h-5 w-5" aria-hidden="true" />}
          title={`No matches for “${query.trim()}”`}
          body="Try a different keyword, or clear the search to browse every listing in this catalogue."
        >
          <Button size="md" variant="secondary" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </StatePanel>
      ) : (
        <div className={`mt-5 ${PRODUCT_GRID_CLASS}`}>
          {filtered.map((product, index) => (
            <Reveal key={product.slug} staggerIndex={index}>
              <ProductCard
                href={`/products/${product.slug}`}
                name={product.name}
                brand={product.brand}
                size={product.size}
                description={product.description}
                price={product.price}
                comparePrice={product.comparePrice}
                discountPercent={product.discountPercent}
                availability={product.availability}
                imageSrc={product.image}
                imageAlt={product.imageAlt}
                whatsapp={{
                  href: waLink(
                    `Hello Dr. Ali Ahmad, I would like to ask about ${
                      product.brand ? `${product.brand} ` : ""
                    }${product.name}. Please share current availability and pricing.`,
                  ),
                  label: "Enquire",
                }}
                className="h-full"
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
