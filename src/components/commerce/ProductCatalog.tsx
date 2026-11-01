"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, PackageSearch, Phone, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { waLink } from "@/lib/whatsapp";
import {
  productCategories,
  queryProducts,
  type Product,
  type ProductCategorySlug,
  type ProductSort,
} from "@/data/products";

type ProductCatalogProps = {
  /** Products already scoped to the route's category (same data source). */
  products: Product[];
  /** Preset category from the route; "all" marks the All Products chip. */
  activeCategory?: ProductCategorySlug | "all";
};

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
];

const chipBase =
  "inline-flex h-10 items-center rounded-control px-3.5 text-[13.5px] font-medium leading-none transition-colors duration-[180ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

const chipActive = cn(chipBase, "bg-forest text-white");

const chipIdle = cn(
  chipBase,
  "border border-border-subtle bg-white text-charcoal hover:border-forest/40 hover:text-forest",
);

/**
 * Shared catalogue body: route-based category navigation, search + sort over
 * one dataset, a live result count, and safe empty states (catalogue not yet
 * published vs. no search matches).
 */
export function ProductCatalog({
  products,
  activeCategory = "all",
}: ProductCatalogProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProductSort>("featured");

  const filtered = useMemo(
    () => queryProducts(products, { query, sort }),
    [products, query, sort],
  );

  const catalogueEmpty = products.length === 0;
  const activeCategoryMeta =
    activeCategory === "all"
      ? undefined
      : productCategories.find((category) => category.slug === activeCategory);

  const enquiryMessage = `Hello Dr. Ali Ahmad, I would like to ask about ${
    activeCategoryMeta ? activeCategoryMeta.name : "the products in your catalogue"
  }. Please share current availability, pack sizes, and pricing.`;

  return (
    <div>
      {/* Category navigation — route based, one chip per catalogue */}
      <nav aria-label="Product categories" className="mb-6">
        <ul className="flex flex-wrap items-center gap-2">
          <li>
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
          {productCategories.map((category) => (
            <li key={category.slug}>
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

      {/* Search + sort */}
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

        <div className="flex items-center gap-2.5">
          <label htmlFor="product-sort" className="text-[14px] text-muted">
            Sort by
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as ProductSort)}
            className="h-10 max-w-[220px] flex-1 rounded-control border border-border-subtle bg-white px-3 text-[14.5px] text-charcoal transition-colors duration-[180ms] focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:flex-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live result count — derived from the filtered dataset */}
      {!catalogueEmpty ? (
        <p className="mt-5 text-[14px] leading-6 text-muted" role="status">
          {filtered.length === 0
            ? "No products match your search."
            : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`}
        </p>
      ) : null}

      {catalogueEmpty ? (
        <div className="mt-6 rounded-card border border-border-subtle bg-white px-6 py-12 text-center sm:py-14">
          <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-control border border-border-subtle bg-ivory text-forest">
            <PackageSearch className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-[20px] font-medium tracking-[-0.01em] text-charcoal">
            Products are being updated
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">
            Verified listings, pack sizes, and pricing are being prepared for
            this catalogue. Message the practice to check current availability.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-5 rounded-card border border-dashed border-border-subtle bg-white/70 px-6 py-10 text-center">
          <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-muted">
            Try a different keyword, or clear the search to browse every
            listing in this catalogue.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 inline-flex h-10 items-center rounded-control border border-forest/30 px-4 text-[14px] font-medium text-forest transition-colors duration-[180ms] hover:border-forest hover:bg-forest/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, index) => (
            <Reveal key={product.slug} staggerIndex={index}>
              <ProductCard
                href={`/products/${product.slug}`}
                name={product.name}
                brand={product.brand}
                size={product.size}
                description={product.description}
                price={product.price}
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
