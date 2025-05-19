"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vendorService } from "@/services/vendor.service";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/validation/schema";
import Image from "next/image";

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getProducts(
        page,
        search,
        selectedCategory
      );
      const validProducts = response.data.filter(
        (product) =>
          product &&
          product._id &&
          product.name &&
          product.category &&
          product.category._id &&
          product.category.name
      );
      if (validProducts.length < response.data.length) {
        console.warn(
          "Filtered out invalid products:",
          response.data.filter(
            (product) =>
              !product ||
              !product._id ||
              !product.name ||
              !product.category ||
              !product.category._id ||
              !product.category.name
          )
        );
        toast.warning(
          "Some products could not be displayed due to missing or invalid data."
        );
      }
      setProducts(validProducts);
    } catch (error) {
      console.error("Error fetching products:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch products. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await vendorService.getCategories();
      setCategories(response.data);
      if (response.data.length > 0 && !editingProduct) {
        setValue("categoryId", response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, search, selectedCategory]);

  const handleDelete = async (id) => {
    try {
      const response = await vendorService.deleteProduct(id);
      if (response.status === 200) {
        toast.success(response.message || "Product deleted successfully");
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const handleUpdateStock = async (id, stock) => {
    try {
      const response = await vendorService.updateStock(id, Number(stock));
      if (response.status === 200) {
        toast.success(response.message || "Stock updated successfully");
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setValue("name", product.name);
    setValue("description", product.description);
    setValue("price", product.price.toString());
    setValue("stock", product.stock.toString());
    setValue("content", product.content || "");
    setValue("categoryId", product.category?._id || categories[0]?._id || "");
    setPreviewImages(product.images || []);
    setSelectedImages([]);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Add basic product information
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("stock", data.stock.toString());
      formData.append("content", data.content);
      formData.append("categoryId", data.categoryId);

      // Handle image uploads
      if (selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      let response;
      if (editingProduct) {
        response = await vendorService.updateProduct(
          editingProduct._id,
          formData
        );
        if (response.status === 200) {
          toast.success(response.message || "Product updated successfully");
        }
      } else {
        response = await vendorService.addProduct(formData);
        if (response.status === 201) {
          toast.success(response.message || "Product added successfully");
        }
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setSelectedImages([]);
      setPreviewImages([]);
      reset();
      fetchProducts();
    } catch (error) {
      console.error("Error submitting product:", error);
      const errorMessage =
        error.response?.data?.message ||
        (editingProduct ? "Failed to update product" : "Failed to add product");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => {
            setEditingProduct(null);
            setSelectedImages([]);
            setPreviewImages([]);
            reset();
            if (categories.length > 0) {
              setValue("categoryId", categories[0]._id);
            }
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  {...register("description")}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Content
                </label>
                <Input
                  {...register("content")}
                  className={errors.content ? "border-red-500" : ""}
                  placeholder="e.g., 250ml glass bottle"
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.content.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("price")}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <Input
                  type="number"
                  {...register("stock")}
                  className={errors.stock ? "border-red-500" : ""}
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.stock.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  {...register("categoryId")}
                  className={`w-full rounded-md border ${
                    errors.categoryId ? "border-red-500" : "border-input"
                  } px-3 py-2`}
                >
                  {categories.length === 0 ? (
                    <option value="">No categories available</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Images</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-orange-600 hover:text-orange-500">
                        <span>Upload files</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {errors.images && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.images.message}
                  </p>
                )}
                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {editingProduct ? "Update" : "Add"} Product
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-input px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="p-4">
                <div className="flex flex-col h-full">
                  {product.images && product.images.length > 0 && (
                    <div className="mb-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {product.category?.name || "No category"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.description}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {product.content || "No content"}
                  </p>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">${product.price}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Stock:</span>
                        <Input
                          type="number"
                          value={product.stock}
                          onChange={(e) =>
                            handleUpdateStock(product._id, e.target.value)
                          }
                          className="w-20 h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <Button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span>Page {page + 1}</span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={products.length < 20}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
