import apiClient from "@/lib/axios";

export const adminService = {
  getUsers: async () => {
    const response = await apiClient.get("/users");
    return response.data;
  },
  getUserDetails: async () => {
    const response = await apiClient.get("/users/:userId");
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
};
