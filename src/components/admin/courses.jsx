"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  BookOpen,
  Video,
  FileText,
  Edit,
} from "lucide-react";
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "");

export function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [lastId, setLastId] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchCourses = async (reset = false) => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        categoryId: selectedCategory,
        level: selectedLevel,
        sortBy,
        sortOrder,
        lastId: reset ? null : lastId,
      };

      const response = await adminService.getCourses(params);

      if (reset) {
        setCourses(response.data.courses || []);
      } else {
        setCourses((prev) => [...prev, ...(response.data.courses || [])]);
      }

      setHasMore(response.data.hasMore || false);
      setLastId(response.data.nextCursor || null);
    } catch (error) {
      toast.error("Failed to fetch courses");
      console.error(error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCourseCategories();
      setCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setLastId(null);
      fetchCourses(true);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedLevel, sortBy, sortOrder]);

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      await adminService.deleteCourse(courseToDelete._id);
      toast.success("Course deleted successfully");
      setCourseToDelete(null);
      setLastId(null);
      fetchCourses(true);
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchCourses(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedLevel("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Course Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/dashboard/course-categories")}
          >
            Manage Categories
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => router.push("/admin/dashboard/courses/add")}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="title">Title</option>
                  <option value="enrollmentCount">Enrollment Count</option>
                  <option value="rating.average">Rating</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          )}

          {showFilters && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course._id} className="p-6">
            <div className="flex flex-col h-full">
              {course.thumbnail && (
                <div className="mb-4">
                  <img
                    src={`${BASE_URL}${course.thumbnail}`}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                    }}
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold line-clamp-2">
                    {course.title}
                  </h3>
                  <Badge
                    variant={
                      course.level === "beginner"
                        ? "default"
                        : course.level === "intermediate"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {course.level}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span>{course.category?.name || "No category"}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">
                      ${course.price?.usd || 0} / NPR {course.price?.npr || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Enrollments:</span>
                    <span>{course.enrollmentCount || 0}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {course.contentCounts?.total ||
                          course.notes?.length ||
                          0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>
                        {course.contentCounts?.pdfs || course.pdfCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>
                        {course.contentCounts?.videos || course.videoCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/dashboard/courses/${course._id}`)
                  }
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/dashboard/courses/${course._id}/edit`)
                  }
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCourseToDelete(course)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={loadMore} disabled={loading} variant="outline">
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new course.
          </p>
          <div className="mt-6">
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => router.push("/admin/dashboard/courses/add")}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Course
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={() => setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This
              action cannot be undone and will also delete all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteCourse}
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
