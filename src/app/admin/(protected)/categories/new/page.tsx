import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { fetchAdminCategories } from "@/lib/catalog";
import { CategoryForm } from "../CategoryForm";

export const metadata: Metadata = {
  title: "Add category",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function NewCategoryPage() {
  const categories = await fetchAdminCategories();
  const parentOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <Container>
      <h1 className="font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-charcoal sm:text-[36px]">
        Add category
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Categories group products in the catalogue. New categories appear in
        public navigation and the /products tiles as soon as they are active.
      </p>
      <div className="mt-8">
        <CategoryForm parentOptions={parentOptions} />
      </div>
    </Container>
  );
}
