import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { fetchAdminCategories, fetchAdminProductById } from "@/lib/catalog";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export const instant = false;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const [product, categories] = await Promise.all([
    fetchAdminProductById(id),
    fetchAdminCategories(),
  ]);
  if (!product) notFound();

  return (
    <Container>
      <h1 className="font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-charcoal sm:text-[36px]">
        Edit product
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        {product.is_published
          ? "This listing is live on the public catalogue."
          : "This listing is a draft — hidden from the public catalogue."}
      </p>
      <div className="mt-8">
        <ProductForm product={product} categories={categories} />
      </div>
    </Container>
  );
}
