import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ProductCatalog } from "@/components/commerce/ProductCatalog";
import { CatalogueErrorState } from "@/components/commerce/CatalogueStates";
import { fetchCatalogProducts, fetchPublicCategories } from "@/lib/catalog";
import type { Product } from "@/data/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Shop pet food, animal feed, grooming supplies, accessories, and healthcare products for dogs, cats, and livestock.",
};

// Product data is fetched per request (Supabase + RLS; admins also see drafts).
export const instant = false;

export default async function ProductsPage() {
  const categories = await fetchPublicCategories();
  let products: Product[] | null = null;
  try {
    products = await fetchCatalogProducts();
  } catch {
    products = null;
  }

  return (
    <>
      {/* Category tiles */}
      <Section
        surface="white"
        spacingClassName="pt-8 pb-12 md:pt-12 md:pb-16 lg:pt-16 lg:pb-20"
      >
        <Reveal>
          <h2 className="max-w-2xl text-balance text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-charcoal sm:text-[32px] md:text-[38px]">
            Browse by category
          </h2>
        </Reveal>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 sm:gap-6 md:mt-9 lg:grid-cols-3">
          {categories.map((category, i) => (
            <Reveal key={category.slug} staggerIndex={i} className="h-full">
              <Link
                href={category.href}
                className="group flex h-full flex-col overflow-hidden rounded-card border border-border-subtle bg-white transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-card-hover focus-visible:border-forest/25 focus-visible:shadow-card-hover"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-sage/50">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.imageAlt ?? category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package
                        className="h-8 w-8 text-forest/30"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-charcoal transition-colors group-hover:text-forest">
                    {category.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[14px] leading-[1.65] text-muted">
                    {category.description}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Full catalog with client-side filter */}
      <Section
        id="catalog"
        surface="ivory"
        spacingClassName="pt-10 pb-14 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24"
      >
        <Reveal>
          <h2 className="max-w-2xl text-balance text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-charcoal sm:text-[32px] md:text-[38px]">
            All products
          </h2>
        </Reveal>
        <div className="mt-10">
          {products ? (
            <ProductCatalog products={products} categories={categories} />
          ) : (
            <CatalogueErrorState
              retryHref="/products"
              whatsappMessage="Hello Dr. Ali Ahmad, I would like to ask about the products in your catalogue. Please share current availability, pack sizes, and pricing."
            />
          )}
        </div>
      </Section>
    </>
  );
}
