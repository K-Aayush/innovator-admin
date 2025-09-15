"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema } from "@/validation/schema";
import { Upload, Plus, Trash2, ArrowLeft } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "");

export function EditCoursePage({ courseId }) {
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [notes, setNotes] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseSchema),
  });

  const fetchCourse = async () => {
    try {
      setFetchLoading(true);
      const response = await adminService.getCourseDetails(courseId);
      const courseData = response.data;
      setCourse(courseData);

      // Populate form with existing data
      reset({
        title: courseData.title,
        description: courseData.description,
        categoryId: courseData.category?._id,
        level: courseData.level,
        language: courseData.language || "English",
        duration: courseData.duration || "",
        price: {
          usd: courseData.price?.usd?.toString() || "0",
          npr: courseData.price?.npr?.toString() || "0",
        },
        tags: courseData.tags?.join(", ") || "",
        prerequisites: courseData.prerequisites?.join("\n") || "",
        learningOutcomes: courseData.learningOutcomes?.join("\n") || "",
      });

      // Set thumbnail preview
      if (courseData.thumbnail) {
        setThumbnailPreview(`${BASE_URL}${courseData.thumbnail}`);
      }

      // Set notes
      if (courseData.notes) {
        setNotes(
          courseData.notes.map((note, index) => ({
            id: note._id || Date.now() + index,
            name: note.name,
            file: null, // We don't have the file object, just the path
            existingFile: note.pdf,
            premium: note.premium,
            description: note.description || "",
            duration: note.duration || "",
            sortOrder: note.sortOrder || index,
          }))
        );
      }
    } catch (error) {
      toast.error("Failed to fetch course details");
      router.push("/admin/dashboard/courses");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCourseCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchCategories();
    }
  }, [courseId]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addNote = () => {
    setNotes([
      ...notes,
      {
        id: Date.now(),
        name: "",
        file: null,
        existingFile: "",
        premium: false,
        description: "",
        duration: "",
        sortOrder: notes.length,
      },
    ]);
  };

  const updateNote = (id, field, value) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, [field]: value } : note))
    );
  };

  const removeNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleNoteFileChange = (id, file) => {
    updateNote(id, "file", file);
    updateNote(id, "existingFile", ""); // Clear existing file when new file is selected
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Upload thumbnail if changed
      let thumbnailPath = course.thumbnail;
      if (thumbnailFile) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append("files", thumbnailFile);

        const thumbnailResponse = await adminService.uploadCourseFiles(
          thumbnailFormData,
          "public"
        );
        thumbnailPath = thumbnailResponse.data[0];
      }

      // Process notes
      const processedNotes = [];
      for (const note of notes) {
        let filePath = note.existingFile; // Keep existing file if no new file

        if (note.file) {
          // Upload new file
          const fileFormData = new FormData();
          fileFormData.append("files", note.file);

          const fileResponse = await adminService.uploadCourseFiles(
            fileFormData,
            note.premium ? "private" : "public"
          );
          filePath = fileResponse.data[0];
        }

        processedNotes.push({
          name: note.name,
          pdf: filePath,
          premium: note.premium,
          description: note.description,
          duration: note.duration,
          sortOrder: note.sortOrder,
        });
      }

      // Process tags, prerequisites, and learning outcomes
      const processedData = {
        ...data,
        thumbnail: thumbnailPath,
        notes: processedNotes,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
        prerequisites: data.prerequisites
          ? data.prerequisites.split("\n").filter((item) => item.trim())
          : [],
        learningOutcomes: data.learningOutcomes
          ? data.learningOutcomes.split("\n").filter((item) => item.trim())
          : [],
      };

      await adminService.updateCourse(courseId, processedData);
      toast.success("Course updated successfully");
      router.push(`/admin/dashboard/courses/${courseId}`);
    } catch (error) {
      console.error("Course update error:", error);
      toast.error(error.response?.data?.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Course not found
        </h2>
        <Button
          className="mt-4"
          onClick={() => router.push("/admin/dashboard/courses")}
        >
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-semibold">Edit Course</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Title *
              </label>
              <Input
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
                placeholder="Enter course title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description *
              </label>
              <textarea
                {...register("description")}
                className={`w-full rounded-md border ${
                  errors.description ? "border-red-500" : "border-input"
                } px-3 py-2`}
                rows={4}
                placeholder="Enter course description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category *
                </label>
                <select
                  {...register("categoryId")}
                  className={`w-full rounded-md border ${
                    errors.categoryId ? "border-red-500" : "border-input"
                  } px-3 py-2`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Level *
                </label>
                <select
                  {...register("level")}
                  className={`w-full rounded-md border ${
                    errors.level ? "border-red-500" : "border-input"
                  } px-3 py-2`}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.level && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.level.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Language
                </label>
                <Input
                  {...register("language")}
                  placeholder="e.g., English, Nepali"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price USD *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price.usd")}
                  className={errors.price?.usd ? "border-red-500" : ""}
                  placeholder="0.00"
                />
                {errors.price?.usd && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.price.usd.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Price NPR *
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("price.npr")}
                  className={errors.price?.npr ? "border-red-500" : ""}
                  placeholder="0"
                />
                {errors.price?.npr && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.price.npr.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <Input
                {...register("duration")}
                placeholder="e.g., 4 weeks, 20 hours"
              />
            </div>
          </div>
        </Card>

        {/* Thumbnail */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Course Thumbnail</h2>
          <div className="space-y-4">
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload new thumbnail</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
            {thumbnailPreview && (
              <div className="mt-4">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Course Content */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Course Content</h2>
            <Button type="button" onClick={addNote} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Content
            </Button>
          </div>

          <div className="space-y-4">
            {notes.map((note, index) => (
              <Card key={note.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium">Content Item {index + 1}</h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Content Name *
                    </label>
                    <Input
                      value={note.name}
                      onChange={(e) =>
                        updateNote(note.id, "name", e.target.value)
                      }
                      placeholder="e.g., Introduction to React"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Duration
                    </label>
                    <Input
                      value={note.duration}
                      onChange={(e) =>
                        updateNote(note.id, "duration", e.target.value)
                      }
                      placeholder="e.g., 15 minutes"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={note.description}
                      onChange={(e) =>
                        updateNote(note.id, "description", e.target.value)
                      }
                      className="w-full rounded-md border border-input px-3 py-2"
                      rows={2}
                      placeholder="Brief description of this content"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      File (PDF/Video)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
                      onChange={(e) =>
                        handleNoteFileChange(note.id, e.target.files[0])
                      }
                      className="w-full rounded-md border border-input px-3 py-2"
                    />
                    {note.existingFile && !note.file && (
                      <p className="text-xs text-green-600 mt-1">
                        Current file: {note.existingFile.split("/").pop()}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: PDF, MP4, AVI, MOV, WMV, FLV, WebM, MKV
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={note.premium}
                        onChange={(e) =>
                          updateNote(note.id, "premium", e.target.checked)
                        }
                        className="mr-2"
                      />
                      Premium Content
                    </label>
                  </div>
                </div>
              </Card>
            ))}

            {notes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No content added yet. Click "Add Content" to get started.
              </div>
            )}
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <Input
                {...register("tags")}
                placeholder="react, javascript, frontend (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter tags separated by commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Prerequisites
              </label>
              <textarea
                {...register("prerequisites")}
                className="w-full rounded-md border border-input px-3 py-2"
                rows={3}
                placeholder="List prerequisites, one per line"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each prerequisite on a new line
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Learning Outcomes
              </label>
              <textarea
                {...register("learningOutcomes")}
                className="w-full rounded-md border border-input px-3 py-2"
                rows={3}
                placeholder="List what students will learn, one per line"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each learning outcome on a new line
              </p>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </div>
            ) : (
              "Update Course"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
