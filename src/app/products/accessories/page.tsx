import {
  CategoryPageView,
  categoryMetadata,
} from "@/components/commerce/CategoryPageView";

export const metadata = categoryMetadata("accessories");

// Products are fetched per request (Supabase + RLS).
export const instant = false;

export default function AccessoriesPage() {
  return <CategoryPageView slug="accessories" />;
}
