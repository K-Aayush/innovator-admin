import apiClient from "@/lib/axios";

export const authService = {
  login: async (data) => {
    const response = await apiClient.post("/login", data);
    return response.data;
  },
};
