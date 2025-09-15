import { VendorOrderDetailsPage } from "@/components/vendor/order-details";

export default async function VendorOrderDetails({ params }) {
  const { id } = await params;
  return <VendorOrderDetailsPage orderId={id} />;
}
