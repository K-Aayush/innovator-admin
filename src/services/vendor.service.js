import apiClient from "@/lib/axios";

export const vendorService = {
  // Category Management
  getCategories: async () => {
    const response = await apiClient.get("/vendor-categories");
    return response.data;
  },

  addCategory: async (data) => {
    const response = await apiClient.post("/vendor-add-category", data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/vendor-delete-category/${id}`);
    return response.data;
  },

  // Product Management
  getProducts: async (page = 0, search = "", category = "") => {
    const response = await apiClient.get(`/vendor-list-shops/${page}`, {
      params: { search, category },
    });
    return response.data;
  },

  getSingleProduct: async (id) => {
    const response = await apiClient.get(`/vendor-get-shop/${id}`);
    return response.data;
  },

  addProduct: async (data) => {
    const response = await apiClient.post("/vendor-add-shop", data);
    return response.data;
  },

  updateStock: async (id, stock) => {
    const response = await apiClient.post(`/vendor-update-shop/${id}`, {
      stock,
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/vendor-delete-shop/${id}`);
    return response.data;
  },

  uploadImages: async (formData) => {
    const response = await apiClient.post(
      "/vendor-upload-shop-images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
