import {
  CategoryPageView,
  categoryMetadata,
} from "@/components/commerce/CategoryPageView";

export const metadata = categoryMetadata("grooming");

// Products are fetched per request (Supabase + RLS).
export const instant = false;

export default function GroomingPage() {
  return <CategoryPageView slug="grooming" />;
}
