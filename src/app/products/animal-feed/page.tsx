import {
  CategoryPageView,
  categoryMetadata,
} from "@/components/commerce/CategoryPageView";

export const metadata = categoryMetadata("animal-feed");

// Products are fetched per request (Supabase + RLS).
export const instant = false;

export default function AnimalFeedPage() {
  return <CategoryPageView slug="animal-feed" />;
}
