import { VendorOrderManagementPage } from "@/components/vendor/order-management";

export default async function VendorOrderManagement({ params }) {
  const { id } = await params;
  return <VendorOrderManagementPage orderId={id} />;
}
