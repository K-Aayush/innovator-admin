import apiClient from "@/lib/axios";

export const orderService = {
  // Vendor order methods
  getVendorOrders: async (params = {}) => {
    const response = await apiClient.get("/vendor-orders", { params });
    return response.data;
  },

  getVendorOrderDetails: async (orderId) => {
    const response = await apiClient.get(`/vendor-orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, data) => {
    const response = await apiClient.patch(
      `/vendor-orders/${orderId}/status`,
      data
    );
    return response.data;
  },
};
