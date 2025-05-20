import apiClient from "@/lib/axios";

export const vendorService = {
  getCategories: async () => {
    const response = await apiClient.get("/vendor-categories");
    return response.data;
  },
  addCategory: async (data) => {
    const response = await apiClient.post("/vendor-add-category", data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await apiClient.put(`/vendor-update-category/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/vendor-delete-category/${id}`);
    return response.data;
  },
  getProducts: async (page = 0, search = "", category = "") => {
    try {
      const response = await apiClient.get(`/vendor-list-shops/${page}`, {
        params: { search, category },
      });
      return response.data;
    } catch (error) {
      console.error("vendorService.getProducts error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        page,
        search,
        category,
      });
      throw error;
    }
  },
  getSingleProduct: async (id) => {
    const response = await apiClient.get(`/vendor-get-shop/${id}`);
    return response.data;
  },
  addProduct: async (formData) => {
    const response = await apiClient.post("/vendor-add-shop", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateProduct: async (id, formData) => {
    const response = await apiClient.put(`/vendor-products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateStock: async (id, stock) => {
    const response = await apiClient.patch(`/vendor-products/${id}/stock`, {
      stock,
    });
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/vendor-products/${id}`);
    return response.data;
  },
};