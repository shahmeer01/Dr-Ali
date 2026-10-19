import {
  CategoryPageView,
  categoryMetadata,
} from "@/components/commerce/CategoryPageView";

export const metadata = categoryMetadata("healthcare");

export default function HealthcarePage() {
  return <CategoryPageView slug="healthcare" />;
}
