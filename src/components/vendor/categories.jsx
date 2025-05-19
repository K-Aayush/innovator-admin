// CategoriesPage.jsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vendorService } from "@/services/vendor.service";
import { toast } from "@/components/ui/sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({ name: "", description: "" });

  const validateForm = () => {
    const errors = { name: "", description: "" };
    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    setFormErrors(errors);
    return !errors.name && !errors.description;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getCategories();
      console.log("Fetched categories:", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(
        error.response?.data?.message || "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      if (editingCategory) {
        await vendorService.updateCategory(editingCategory._id, formData);
        toast.success("Category updated successfully");
      } else {
        await vendorService.addCategory(formData);
        toast.success("Category added successfully");
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
      setFormErrors({ name: "", description: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error submitting category:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(
        error.response?.data?.message ||
          (editingCategory
            ? "Failed to update category"
            : "Failed to add category")
      );
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setFormErrors({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await vendorService.deleteCategory(id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: "", description: "" });
            setFormErrors({ name: "", description: "" });
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormErrors({ name: "", description: "" });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter category name"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter category description"
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormErrors({ name: "", description: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {editingCategory ? "Update" : "Add"} Category
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Card className="p-6">
        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.description || "No description"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
