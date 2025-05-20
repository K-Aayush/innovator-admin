import { ProductDetails } from "@/components/vendor/product-details";

export default function ProductDetailsPage({ params }) {
  return <ProductDetails id={params.id} />;
}
