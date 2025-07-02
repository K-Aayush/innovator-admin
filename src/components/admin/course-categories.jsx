"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { Plus, Edit, Trash2, FolderTree, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CourseCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#4A90E2",
    parentCategory: "",
    sortOrder: 0,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCourseCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminService.updateCourseCategory(editingCategory._id, formData);
        toast.success("Category updated successfully");
      } else {
        await adminService.createCourseCategory(formData);
        toast.success("Category created successfully");
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#4A90E2",
      parentCategory: category.parentCategory || "",
      sortOrder: category.sortOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await adminService.deleteCourseCategory(categoryToDelete._id);
      toast.success("Category deleted successfully");
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "#4A90E2",
      parentCategory: "",
      sortOrder: 0,
    });
  };

  const openAddModal = () => {
    setEditingCategory(null);
    resetForm();
    setIsModalOpen(true);
  };

  const renderCategoryTree = (categories, level = 0) => {
    return categories
      .filter((cat) => (level === 0 ? !cat.parentCategory : cat.parentCategory))
      .map((category) => (
        <div key={category._id} className={`${level > 0 ? "ml-8" : ""}`}>
          <Card className="p-4 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {category.icon && (
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-500">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-1">
                    <Badge variant="secondary">
                      {category.metadata?.totalCourses || 0} courses
                    </Badge>
                    <Badge variant="outline">
                      {category.metadata?.totalPDFs || 0} PDFs
                    </Badge>
                    <Badge variant="outline">
                      {category.metadata?.totalVideos || 0} videos
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCategoryToDelete(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="ml-4">
              {renderCategoryTree(category.subcategories, level + 1)}
            </div>
          )}
        </div>
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Course Categories</h1>
        <Button
          className="bg-blue-500 hover:bg-blue-600"
          onClick={openAddModal}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Category Modal */}
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
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter category description"
                  className="w-full rounded-md border border-input px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Icon (emoji)
                  </label>
                  <Input
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="📚"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Color
                  </label>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, parentCategory: e.target.value })
                  }
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="">None (Root Category)</option>
                  {categories
                    .filter(
                      (cat) =>
                        !cat.parentCategory && cat._id !== editingCategory?._id
                    )
                    .map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                  {editingCategory ? "Update" : "Create"} Category
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No categories
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first course category.
            </p>
            <div className="mt-6">
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                onClick={openAddModal}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </div>
          </div>
        ) : (
          renderCategoryTree(categories)
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This
              action cannot be undone. Make sure there are no courses in this
              category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
