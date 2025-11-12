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

  /**
   * Fetch products with optional search, category, and stock sorting
   * @param page - Page number (0-indexed)
   * @param search - Search query
   * @param category - Category ID
   * @param sortStock - "asc" | "desc" | ""
   */
  getProducts: async (page = 0, search = "", category = "", sortStock = "") => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (sortStock) params.append("sortStock", sortStock);

      const response = await apiClient.get(`/vendor-list-shops/${page}`, {
        params,
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
        sortStock,
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