import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { fetchAdminCategories } from "@/lib/catalog";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = {
  title: "Add product",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function NewProductPage() {
  const categories = await fetchAdminCategories();

  return (
    <Container>
      <h1 className="font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-charcoal sm:text-[36px]">
        Add product
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Create a new catalogue listing. Products start as drafts until you
        mark them published.
      </p>
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </Container>
  );
}
