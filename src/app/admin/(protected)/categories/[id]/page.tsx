import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { fetchAdminCategories, fetchAdminCategoryById } from "@/lib/catalog";
import { CategoryForm } from "../CategoryForm";

export const metadata: Metadata = {
  title: "Edit category",
  robots: { index: false, follow: false },
};

export const instant = false;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Eligible parents exclude the category itself and everything beneath it
 * (self-parent and cycles are impossible from this list; the save action
 * re-validates the submitted value server-side anyway).
 */
function eligibleParentOptions(
  categories: Awaited<ReturnType<typeof fetchAdminCategories>>,
  currentId: string,
): { id: string; name: string }[] {
  const childrenByParent = new Map<string, string[]>();
  for (const category of categories) {
    if (category.parent_category_id) {
      const siblings =
        childrenByParent.get(category.parent_category_id) ?? [];
      siblings.push(category.id);
      childrenByParent.set(category.parent_category_id, siblings);
    }
  }
  const excluded = new Set<string>([currentId]);
  const queue = [currentId];
  while (queue.length > 0) {
    const parentId = queue.pop() as string;
    for (const childId of childrenByParent.get(parentId) ?? []) {
      if (!excluded.has(childId)) {
        excluded.add(childId);
        queue.push(childId);
      }
    }
  }
  return categories
    .filter((category) => !excluded.has(category.id))
    .map((category) => ({ id: category.id, name: category.name }));
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const [category, categories] = await Promise.all([
    fetchAdminCategoryById(id),
    fetchAdminCategories(),
  ]);
  if (!category) notFound();

  const parentOptions = eligibleParentOptions(categories, id);

  return (
    <Container>
      <h1 className="font-display text-[30px] font-medium leading-[1.2] tracking-[-0.01em] text-charcoal sm:text-[36px]">
        Edit category
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        {category.is_active
          ? "This category is visible in public navigation and tiles."
          : "This category is hidden from the public site."}
      </p>
      <div className="mt-8">
        <CategoryForm category={category} parentOptions={parentOptions} />
      </div>
    </Container>
  );
}
