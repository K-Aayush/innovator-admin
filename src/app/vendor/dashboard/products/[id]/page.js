import { ProductDetails } from "@/components/vendor/product-details";

export default async function ProductDetailsPage({ params }) {
  const { id } = await params; 
  return <ProductDetails id={id} />;
}
