"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Save,
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

export function VendorOrderManagementPage({ orderId }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    vendorNotes: "",
    trackingNumber: "",
    estimatedDelivery: "",
  });

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getVendorOrderDetails(orderId);
      setOrder(response.data);
      setFormData({
        status: response.data.status,
        vendorNotes: response.data.vendorNotes || "",
        trackingNumber: response.data.trackingNumber || "",
        estimatedDelivery: response.data.estimatedDelivery
          ? new Date(response.data.estimatedDelivery)
              .toISOString()
              .split("T")[0]
          : "",
      });
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

  const handleUpdateOrder = async () => {
    try {
      setUpdating(true);
      const updateData = {
        status: formData.status,
        vendorNotes: formData.vendorNotes,
        trackingNumber: formData.trackingNumber,
        estimatedDelivery: formData.estimatedDelivery || undefined,
      };

      await orderService.updateOrderStatus(orderId, updateData);
      toast.success("Order updated successfully");
      router.push(`/vendor/dashboard/orders/${orderId}`);
    } catch (error) {
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

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
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-semibold">Manage Order</h1>
      </div>

      {/* Order Summary */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Order #{order.orderNumber}</h2>
            <p className="text-gray-600">Customer: {order.customer.name}</p>
            <p className="text-gray-600">
              Total: NPR {order.orderSummary.total}
            </p>
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </div>

        {/* Payment Proof */}
        {order.paymentInfo.paymentProof && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Payment Proof</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <img
                src={`${BASE_URL}${order.paymentInfo.paymentProof}`}
                alt="Payment Proof"
                className="w-full max-w-md h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
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
              <p className="text-sm text-gray-600 mt-2">
                Amount Paid: NPR {order.paymentInfo.paidAmount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Click to view full size
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Order Management Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Order Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full rounded-md border border-input px-3 py-2"
              required
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the current status of this order
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Vendor Notes
            </label>
            <textarea
              value={formData.vendorNotes}
              onChange={(e) =>
                setFormData({ ...formData, vendorNotes: e.target.value })
              }
              className="w-full rounded-md border border-input px-3 py-2"
              rows={3}
              placeholder="Add any notes for the customer..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tracking Number
              </label>
              <Input
                value={formData.trackingNumber}
                onChange={(e) =>
                  setFormData({ ...formData, trackingNumber: e.target.value })
                }
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Estimated Delivery Date
              </label>
              <Input
                type="date"
                value={formData.estimatedDelivery}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDelivery: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleUpdateOrder}
              disabled={updating}
            >
              {updating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Order
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

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
      </Card>

      {/* Customer & Delivery Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {order.customer.name}
            </p>
            <p>
              <strong>Email:</strong> {order.customer.email}
            </p>
            <p>
              <strong>Phone:</strong> {order.customer.phone}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
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
        </Card>
      </div>
    </div>
  );
}
