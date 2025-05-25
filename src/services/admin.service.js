import apiClient from "@/lib/axios";

export const adminService = {
  getUsers: async (page = 0, search = "") => {
    try {
      const response = await apiClient.get("/admin-users", {
        params: { page, search, limit: 20 },
      });
      return response.data;
    } catch (error) {
      console.error("Error in adminService.getUsers:", error.message, error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  getUserDetails: async (userId) => {
    const response = await apiClient.get(`/admin-users/${userId}`);
    return response.data;
  },
  getUserStats: async () => {
    const response = await apiClient.get("/user-stats");
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await apiClient.get("/leaderboard");
    return response.data;
  },
  banUser: async (data) => {
    const response = await apiClient.post("/ban-user", data);
    return response.data;
  },
  deleteContent: async (data) => {
    const response = await apiClient.delete("/user-content", { data });
    return response.data;
  },
  getVendorStats: async () => {
    const response = await apiClient.get("/vendor-stats");
    return response.data;
  },
  addVendor: async (data) => {
    const response = await apiClient.post("/add-vendor", data);
    return response.data;
  },
  handleAd: async (data) => {
    const response = await apiClient.post("/handle-ad", data);
    return response.data;
  },
  getAdStats: async () => {
    const response = await apiClient.get("/ad-stats");
    return response.data;
  },
  getReports: async (page = 0, status = "") => {
    const response = await apiClient.get("/admin-reports", {
      params: { page, status },
    });
    return response.data;
  },
  handleReport: async (data) => {
    const response = await apiClient.post("/admin-handle-report", data);
    return response.data;
  },
  getSupportTickets: async (page = 0, status = "") => {
    const response = await apiClient.get("/admin-support-tickets", {
      params: { page, status },
    });
    return response.data;
  },
  handleSupportTicket: async (data) => {
    const response = await apiClient.post("/admin-handle-support", data);
    return response.data;
  },
};
