import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { CategoryHero } from "@/components/commerce/CategoryHero";
import { CatalogueErrorState } from "@/components/commerce/CatalogueStates";
import { ProductCatalog } from "@/components/commerce/ProductCatalog";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { type Product } from "@/data/products";
import { fetchProductsByCategory, fetchPublicCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Pet Nutrition & Food",
  description:
    "Pet food for dogs and cats from Dr. Ali Ahmad's veterinary practice. Browse the catalogue and message the clinic to check pack sizes, availability, and pricing.",
};

// Products are fetched per request (Supabase + RLS).
export const instant = false;

const breadcrumbTitle = "Pet Nutrition & Food";

export default async function PetFoodPage() {
  const categories = await fetchPublicCategories();
  const active = categories.some((category) => category.slug === "pet-food");
  if (!active) notFound();

  let list: Product[] | null = null;
  try {
    list = await fetchProductsByCategory("pet-food");
  } catch {
    list = null;
  }

  return (
    <>
      {/* Curated copy on the shared category hero */}
      <CategoryHero
        title={breadcrumbTitle}
        description="Pet food for dogs and cats from the practice catalogue. Pack sizes, availability, and pricing are confirmed directly with the clinic."
      />

      {/* Catalogue: category navigation, search, sort, results — same
          spacing system as CategoryPageView (hero owns the gap above the
          chips; this section only carries the exit padding). */}
      <Section
        surface="ivory"
        spacingClassName="pt-0 pb-12 md:pb-16 lg:pb-20"
      >
        {list ? (
          <ProductCatalog
            products={list}
            categories={categories}
            activeCategory="pet-food"
          />
        ) : (
          <CatalogueErrorState
            retryHref="/products/pet-food"
            whatsappMessage="Hello Dr. Ali Ahmad, I would like to ask about pet food. Product:"
          />
        )}
      </Section>

      <WhatsAppBand
        title="Ask about pet food"
        body="Message the practice to check availability, pack sizes, and pricing for any listing."
        whatsappMessage="Hello Dr. Ali Ahmad, I would like to ask about pet food. Product:"
      />
    </>
  );
}
