"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orderService } from "@/services/order.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Filter,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  processing: { color: "bg-purple-100 text-purple-800", icon: Package },
  shipped: { color: "bg-indigo-100 text-indigo-800", icon: Truck },
  delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
  rejected: { color: "bg-gray-100 text-gray-800", icon: XCircle },
};

export function VendorOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    pages: 0,
    hasMore: false,
  });

  const fetchOrders = async (page = 0) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: selectedStatus,
      };

      const response = await orderService.getVendorOrders(params);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const filteredOrders = orders.filter((order) => {
    const orderNumber = order.orderNumber || order._id || "";
    return (
      orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusIcon = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} border-0`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const getStatusCounts = () => {
    const counts = {
      total: orders.length,
      pending: 0,
      approved: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      rejected: 0,
    };

    orders.forEach((order) => {
      if (counts.hasOwnProperty(order.status)) {
        counts[order.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Order Management</h1>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {statusCounts.total}
          </div>
          <div className="text-sm text-gray-500">Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {statusCounts.pending}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {statusCounts.approved}
          </div>
          <div className="text-sm text-gray-500">Approved</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {statusCounts.processing}
          </div>
          <div className="text-sm text-gray-500">Processing</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {statusCounts.shipped}
          </div>
          <div className="text-sm text-gray-500">Shipped</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {statusCounts.delivered}
          </div>
          <div className="text-sm text-gray-500">Delivered</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {statusCounts.cancelled}
          </div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {statusCounts.rejected}
          </div>
          <div className="text-sm text-gray-500">Rejected</div>
        </Card>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Search Orders
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order number or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus
                ? "Try adjusting your filters"
                : "No orders have been placed yet"}
            </p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Customer: {order.customer.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="font-medium">{order.items.length} item(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">NPR {order.orderSummary.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Phone</p>
                  <p className="font-medium">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">
                    {order.paymentInfo.method.replace("_", " ")}
                  </p>
                </div>
              </div>

              {order.paymentInfo.paymentProof && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Payment Proof Available</strong> - Click "View
                    Details" to verify payment
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/vendor/dashboard/orders/${order._id}`)
                    }
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {order.status !== "delivered" &&
                    order.status !== "cancelled" &&
                    order.status !== "rejected" && (
                      <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/vendor/dashboard/orders/${order._id}/manage`
                          )
                        }
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Manage Order
                      </Button>
                    )}
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(order.updatedAt).toLocaleString()}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            onClick={() => fetchOrders(Math.max(0, pagination.page - 1))}
            disabled={pagination.page === 0}
          >
            Previous
          </Button>
          <span>
            Page {pagination.page + 1} of {pagination.pages}
          </span>
          <Button
            onClick={() => fetchOrders(pagination.page + 1)}
            disabled={!pagination.hasMore}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
