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

  // Course Management
  getCourses: async (params = {}) => {
    const response = await apiClient.get("/list-courses", { params });
    return response.data;
  },
  getCourseDetails: async (courseId) => {
    const response = await apiClient.get(`/course/${courseId}`);
    return response.data;
  },
  createCourse: async (data) => {
    const response = await apiClient.post("/add-course", data);
    return response.data;
  },
  updateCourse: async (courseId, data) => {
    const response = await apiClient.put(`/update-course/${courseId}`, data);
    return response.data;
  },
  deleteCourse: async (courseId) => {
    const response = await apiClient.delete(`/delete-courses/${courseId}`);
    return response.data;
  },
  uploadCourseFiles: async (formData, type = "public") => {
    const endpoint =
      type === "private"
        ? "/add-private-course-file"
        : "/add-public-course-file";
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  deleteCourseFiles: async (files) => {
    const response = await apiClient.delete("/delete-course-files", {
      data: files,
    });
    return response.data;
  },
  downloadCourseContent: async (courseId, noteId, type) => {
    const endpoint =
      type === "video"
        ? `/courses/download-video/${courseId}/${noteId}`
        : `/courses/download-pdf/${courseId}/${noteId}`;
    const response = await apiClient.get(endpoint, { responseType: "blob" });
    return response.data;
  },

  // Course Categories
  getCourseCategories: async (params = {}) => {
    const response = await apiClient.get("/course-categories", { params });
    return response.data;
  },
  createCourseCategory: async (data) => {
    const response = await apiClient.post("/admin/course-categories", data);
    return response.data;
  },
  updateCourseCategory: async (categoryId, data) => {
    const response = await apiClient.put(
      `/admin/course-categories/${categoryId}`,
      data
    );
    return response.data;
  },
  deleteCourseCategory: async (categoryId) => {
    const response = await apiClient.delete(
      `/admin/course-categories/${categoryId}`
    );
    return response.data;
  },
  getCoursesByCategory: async (categoryId, params = {}) => {
    const response = await apiClient.get(
      `/course-categories/${categoryId}/courses`,
      { params }
    );
    return response.data;
  },
  getCategoryHierarchy: async () => {
    const response = await apiClient.get("/course-categories/hierarchy");
    return response.data;
  },
};
