import {
  CategoryPageView,
  categoryMetadata,
} from "@/components/commerce/CategoryPageView";

export const metadata = categoryMetadata("grooming");

export default function GroomingPage() {
  return <CategoryPageView slug="grooming" />;
}
