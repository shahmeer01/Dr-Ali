import {
  CategoryPageView,
  categoryMetadata,
} from "@/components/commerce/CategoryPageView";

export const metadata = categoryMetadata("healthcare");

// Products are fetched per request (Supabase + RLS).
export const instant = false;

export default function HealthcarePage() {
  return <CategoryPageView slug="healthcare" />;
}
