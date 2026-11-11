import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { CategoryHero } from "@/components/commerce/CategoryHero";
import { CatalogueErrorState } from "@/components/commerce/CatalogueStates";
import { ProductCatalog } from "@/components/commerce/ProductCatalog";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { getCategoryBySlug, type Product } from "@/data/products";
import {
  fetchProductsByCategory,
  fetchPublicCategories,
} from "@/lib/catalog";

type CategoryPageProps = {
  slug: string;
};

export function categoryMetadata(slug: string): Metadata {
  const category = getCategoryBySlug(slug);
  return {
    title: category ? category.name : "Products",
    description: category?.description,
  };
}

/**
 * Shared category page body. Used by the five static category routes and
 * the dynamic /products/[slug] category fallback. The category must exist
 * and be active (or the whole page 404s); the product list and filter
 * chips come from Supabase (RLS per request). A failed product query
 * renders the catalogue error state instead of an error boundary.
 */
export async function CategoryPageView({ slug }: CategoryPageProps) {
  const categories = await fetchPublicCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  let list: Product[] | null = null;
  try {
    list = await fetchProductsByCategory(slug);
  } catch {
    list = null;
  }

  return (
    <>
      <CategoryHero
        title={category.name}
        description={category.description || undefined}
      />

      {/* Hero carries the description→navigation gap (pb-8 md:pb-10); the
          section keeps its generous exit padding but adds no top padding,
          so breadcrumb → eyebrow → title → description → chips follow one
          rhythm on every static and dynamic category page. */}
      <Section
        surface="ivory"
        spacingClassName="pt-0 pb-12 md:pb-16 lg:pb-20"
      >
        {list ? (
          <ProductCatalog
            products={list}
            categories={categories}
            activeCategory={slug}
          />
        ) : (
          <CatalogueErrorState
            retryHref={category.href}
            whatsappMessage={`Hello Dr. Ali Ahmad, I would like to ask about ${category.name}. Product:`}
          />
        )}
      </Section>

      <WhatsAppBand
        title={`Ask about ${category.name.toLowerCase()}`}
        body="Message the practice to check availability, pack sizes, and pricing for any listing."
        whatsappMessage={`Hello Dr. Ali Ahmad, I would like to ask about ${category.name}. Product:`}
      />
    </>
  );
}
