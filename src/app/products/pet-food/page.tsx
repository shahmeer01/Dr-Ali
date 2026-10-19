import {
  CategoryPageView,
  categoryMetadata,
} from "@/components/commerce/CategoryPageView";

export const metadata = categoryMetadata("pet-food");

export default function PetFoodPage() {
  return <CategoryPageView slug="pet-food" />;
}
