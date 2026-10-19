"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import {
  availabilityLabel,
  productCategories,
  sortProducts,
  type Product,
  type ProductCategorySlug,
  type ProductSort,
} from "@/data/products";

type ProductCatalogProps = {
  products: Product[];
  /** Preset category from the route; "all" shows category chips */
  activeCategory?: ProductCategorySlug | "all";
};

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
];

export function ProductCatalog({
  products,
  activeCategory = "all",
}: ProductCatalogProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProductSort>("featured");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return sortProducts(list, sort);
  }, [products, query, sort]);

  const showChips = activeCategory === "all";

  return (
    <div>
      <Reveal>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted">
          All listings on this site are development demo data. No real prices,
          brands, or product inventory are represented here yet.
        </p>
      </Reveal>

      {/* Category chips (route-based navigation) */}
      {showChips ? (
        <nav aria-label="Product categories" className="mt-6 mb-8">
          <ul className="flex flex-wrap gap-2">
            <li>
              <span
                aria-current="true"
                className="inline-flex h-10 items-center rounded-control bg-forest px-4 text-[14px] font-medium text-white"
              >
                All products
              </span>
            </li>
            {productCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={category.href}
                  className="inline-flex h-10 items-center rounded-control border border-border-subtle bg-white px-4 text-[14px] font-medium text-charcoal transition-colors duration-[180ms] hover:border-forest/40 hover:text-forest"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <nav aria-label="Product categories" className="mt-6 mb-8">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href="/products"
                className="inline-flex h-10 items-center rounded-control border border-border-subtle bg-white px-4 text-[14px] font-medium text-charcoal transition-colors duration-[180ms] hover:border-forest/40 hover:text-forest"
              >
                All products
              </Link>
            </li>
            {productCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={category.href}
                  aria-current={
                    category.slug === activeCategory ? "page" : undefined
                  }
                  className={cn(
                    "inline-flex h-10 items-center rounded-control px-4 text-[14px] font-medium transition-colors duration-[180ms]",
                    category.slug === activeCategory
                      ? "bg-forest text-white"
                      : "border border-border-subtle bg-white text-charcoal hover:border-forest/40 hover:text-forest",
                  )}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Search + sort */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-11 w-full rounded-control border border-border-subtle bg-white pl-10 pr-10 text-[15px] text-charcoal placeholder:text-muted focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-control text-muted transition-colors hover:bg-charcoal/[0.05] hover:text-charcoal"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="product-sort" className="text-[14px] text-muted">
            Sort by
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductSort)}
            className="h-11 rounded-control border border-border-subtle bg-white px-3 text-[15px] text-charcoal focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-5 text-[14px] text-muted" role="status">
        {filtered.length === 0
          ? "No products match your search."
          : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-subtle bg-white/60 px-6 py-14 text-center">
          <p className="text-[17px] font-medium text-charcoal">
            Nothing found
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
            Try a different keyword, or clear the search to browse the full
            demo catalog.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 inline-flex h-10 items-center rounded-control border border-forest/30 px-4 text-[14px] font-medium text-forest transition-colors duration-[180ms] hover:border-forest hover:bg-forest/[0.04]"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => (
            <Reveal key={product.slug} staggerIndex={i}>
              <ProductCard
                href={`/products/${product.slug}`}
                name={product.name}
                brand={product.brand}
                description={product.description}
                price={product.price}
                imageSrc={product.image}
                imageAlt={product.imageAlt}
                availability={availabilityLabel[product.availability]}
                availabilityTone={
                  product.availability === "unavailable" ? "muted" : "neutral"
                }
                demo={product.demo}
                className="h-full"
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
