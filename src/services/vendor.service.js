import apiClient from "@/lib/axios";

export const vendorService = {
  getShops: async (page, search, category) => {
    const response = await apiClient.get(`/vendor-list-shops/${page}`, {
      params: { search, category },
    });
    return response.data;
  },

  getSingleShop: async (id) => {
    const response = await apiClient.get(`/vendor-get-shop/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get("/vendor-categories");
    return response.data;
  },

  addCategory: async (name, description) => {
    const data = { name, description };
    const response = await apiClient.post("/vendor-add-category", data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/vendor-delete-category/${id}`);
    return response.data;
  },

  addShop: async (data) => {
    const response = await apiClient.post("/vendor-add-shop", data);
    return response.data;
  },

  updateStock: async (id, stock) => {
    const response = await apiClient.post(`/vendor-update-shop/${id}`, {
      stock,
    });
    return response.data;
  },

  deleteShop: async (id) => {
    const response = await apiClient.delete(`/vendor-delete-shop/${id}`);
    return response.data;
  },
};
