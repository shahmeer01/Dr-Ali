import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCatalog } from "@/components/commerce/ProductCatalog";
import { WhatsAppBand } from "@/components/ui/WhatsAppBand";
import { Reveal } from "@/components/motion/Reveal";
import { getProductsByCategory } from "@/data/products";

export const metadata: Metadata = {
  title: "Pet Nutrition & Food",
  description:
    "Pet food for dogs and cats from Dr. Ali Ahmad's veterinary practice. Browse the catalogue and message the clinic to check pack sizes, availability, and pricing.",
};

const breadcrumbTitle = "Pet Nutrition & Food";

export default function PetFoodPage() {
  const list = getProductsByCategory("pet-food");

  return (
    <>
      {/* Heading: compact breadcrumb + editorial title block */}
      <div className="bg-ivory">
        <Container>
          <Breadcrumbs
            items={[{ label: "Products", href: "/products" }, { label: breadcrumbTitle }]}
          />
          <Reveal immediate delay={0} className="pb-7 pt-1 md:pb-9">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">
              Products
            </p>
            <h1 className="mt-2.5 text-display text-balance text-[34px] text-charcoal sm:text-[42px] lg:text-[48px]">
              {breadcrumbTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-[16px] leading-relaxed text-muted md:text-[17px]">
              Pet food for dogs and cats from the practice catalogue. Pack
              sizes, availability, and pricing are confirmed directly with the
              clinic.
            </p>
          </Reveal>
        </Container>
      </div>

      {/* Catalogue: category navigation, search, sort, results */}
      <Section surface="ivory" spacingClassName="pb-16 pt-0 md:pb-20">
        <ProductCatalog products={list} activeCategory="pet-food" />
      </Section>

      <WhatsAppBand
        compact
        title="Ask about pet food"
        body="Message the practice to check availability, pack sizes, and pricing for any listing."
        whatsappMessage="Hello Dr. Ali Ahmad, I would like to ask about pet food. Product:"
      />
    </>
  );
}
