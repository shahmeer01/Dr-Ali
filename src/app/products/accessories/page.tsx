import {
  CategoryPageView,
  categoryMetadata,
} from "@/components/commerce/CategoryPageView";

export const metadata = categoryMetadata("accessories");

export default function AccessoriesPage() {
  return <CategoryPageView slug="accessories" />;
}
