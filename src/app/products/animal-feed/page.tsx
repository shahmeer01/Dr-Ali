import {
  CategoryPageView,
  categoryMetadata,
} from "@/components/commerce/CategoryPageView";

export const metadata = categoryMetadata("animal-feed");

export default function AnimalFeedPage() {
  return <CategoryPageView slug="animal-feed" />;
}
