"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/order.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Edit,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "");

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  processing: { color: "bg-purple-100 text-purple-800", icon: Package },
  shipped: { color: "bg-indigo-100 text-indigo-800", icon: Truck },
  delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
  rejected: { color: "bg-gray-100 text-gray-800", icon: XCircle },
};

export function VendorOrderDetailsPage({ orderId }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getVendorOrderDetails(orderId);
      setOrder(response.data);
    } catch (error) {
      toast.error("Failed to fetch order details");
      router.push("/vendor/dashboard/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const getStatusIcon = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} border-0 text-sm`}>
        {getStatusIcon(status)}
        <span className="ml-2 capitalize">{status}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Order not found
        </h2>
        <Button
          className="mt-4 bg-orange-500 hover:bg-orange-600"
          onClick={() => router.push("/vendor/dashboard/orders")}
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-semibold">Order Details</h1>
        </div>
        {order.status !== "delivered" &&
          order.status !== "cancelled" &&
          order.status !== "rejected" && (
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() =>
                router.push(`/vendor/dashboard/orders/${orderId}/manage`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage Order
            </Button>
          )}
      </div>

      {/* Order Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-600">Customer: {order.customer.name}</p>
          </div>
          <div className="text-right">
            {getStatusBadge(order.status)}
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date(order.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-3">
              {order.statusHistory.map((history, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(history.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{history.status}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(history.changedAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Changed by: {history.changedBy}
                    </p>
                    {history.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {history.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Items */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                {item.product.images && item.product.images.length > 0 && (
                  <img
                    src={`${BASE_URL}${item.product.images[0]}`}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                    }}
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">
                    NPR {item.price} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">NPR {item.totalPrice}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t mt-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>NPR {order.orderSummary.subtotal}</span>
              </div>
              {order.orderSummary.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>NPR {order.orderSummary.tax}</span>
                </div>
              )}
              {order.orderSummary.shipping > 0 && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>NPR {order.orderSummary.shipping}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>NPR {order.orderSummary.total}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Information */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {order.customer.picture && (
                  <img
                    src={`${BASE_URL}${order.customer.picture}`}
                    alt={order.customer.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                    }}
                  />
                )}
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-gray-600">
                    {order.customer.email}
                  </p>
                </div>
              </div>
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                {order.customer.phone}
              </p>
            </div>
          </Card>

          {/* Delivery Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Delivery Information
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {order.customerInfo.name}
              </p>
              <p>
                <strong>Phone:</strong> {order.customerInfo.phone}
              </p>
              <p>
                <strong>Address:</strong> {order.customerInfo.address}
              </p>
              {order.customerInfo.notes && (
                <p>
                  <strong>Notes:</strong> {order.customerInfo.notes}
                </p>
              )}
            </div>

            {order.trackingNumber && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tracking Number:</strong> {order.trackingNumber}
                </p>
              </div>
            )}

            {order.estimatedDelivery && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Estimated Delivery:</strong>{" "}
                  {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              </div>
            )}
          </Card>

          {/* Payment Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Information
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Method:</strong>{" "}
                {order.paymentInfo.method.replace("_", " ").toUpperCase()}
              </p>
              <p>
                <strong>Amount Paid:</strong> NPR {order.paymentInfo.paidAmount}
              </p>
              {order.paymentInfo.transactionId && (
                <p>
                  <strong>Transaction ID:</strong>{" "}
                  {order.paymentInfo.transactionId}
                </p>
              )}
            </div>

            {order.paymentInfo.paymentProof && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Payment Proof:</p>
                <div className="border rounded-lg p-2 bg-gray-50">
                  <img
                    src={`${BASE_URL}${order.paymentInfo.paymentProof}`}
                    alt="Payment Proof"
                    className="w-full max-w-sm h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() =>
                      window.open(
                        `${BASE_URL}${order.paymentInfo.paymentProof}`,
                        "_blank"
                      )
                    }
                    onError={(e) => {
                      e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Click to view full size
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Vendor Notes */}
          {order.vendorNotes && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Vendor Notes</h3>
              <p className="text-gray-700">{order.vendorNotes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
