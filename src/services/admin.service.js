import apiClient from "@/lib/axios";

export const adminService = {
  getUserStats: async () => {
    const response = await apiClient.get("/admin/user-stats");
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await apiClient.get("/admin/leaderboard");
    return response.data;
  },
  banUser: async (data) => {
    const response = await apiClient.post("/admin/ban-user", data);
    return response.data;
  },
  deleteContent: async (data) => {
    const response = await apiClient.delete("/admin/user-content", { data });
    return response.data;
  },
  getVendorStats: async () => {
    const response = await apiClient.get("/admin/vendor-stats");
    return response.data;
  },
  addVendor: async (data) => {
    const response = await apiClient.post("/admin/add-vendor", data);
    return response.data;
  },
  handleAd: async (data) => {
    const response = await apiClient.post("/admin/handle-ad", data);
    return response.data;
  },
  getAdStats: async () => {
    const response = await apiClient.get("/admin/ad-stats");
    return response.data;
  },
};
