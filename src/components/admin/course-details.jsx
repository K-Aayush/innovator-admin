"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Download,
  Play,
  FileText,
  Video,
  Clock,
  Users,
  Star,
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

export function CourseDetailsPage({ courseId }) {
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCourseDetails(courseId);
      setCourse(response.data);
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Failed to fetch course details");
      router.push("/admin/dashboard/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const handleDeleteCourse = async () => {
    try {
      await adminService.deleteCourse(courseId);
      toast.success("Course deleted successfully");
      router.push("/admin/dashboard/courses");
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const handleDownload = async (noteId, type) => {
    try {
      const response = await adminService.downloadCourseContent(
        courseId,
        noteId,
        type
      );
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}-${noteId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download content");
    }
  };

  if (loading) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-semibold">Course Details</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/admin/dashboard/courses/${courseId}/edit`)
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Course Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-start gap-6">
              {course.thumbnail && (
                <img
                  src={`${BASE_URL}${course.thumbnail}`}
                  alt={course.title}
                  className="w-48 h-32 object-cover rounded"
                  onError={(e) => {
                    e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                  }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{course.title}</h2>
                    <p className="text-gray-600 mt-2">{course.description}</p>
                  </div>
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-sm font-medium">
                      {course.enrollmentCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Enrollments</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="text-sm font-medium">
                      {course.rating?.average || 0}
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-sm font-medium">
                      {course.duration || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-sm font-medium">
                      {course.contentAnalysis?.totalContent ||
                        course.notes?.length ||
                        0}
                    </div>
                    <div className="text-xs text-gray-500">Content Items</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Course Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Category:
                </span>
                <p className="text-sm">
                  {course.category?.name || "No category"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Language:
                </span>
                <p className="text-sm">{course.language || "English"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Price:
                </span>
                <p className="text-sm font-medium">
                  ${course.price?.usd || 0} / NPR {course.price?.npr || 0}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Author:
                </span>
                <p className="text-sm">{course.author?.email || "Unknown"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Created:
                </span>
                <p className="text-sm">
                  {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Status:
                </span>
                <Badge variant={course.isPublished ? "default" : "secondary"}>
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              {course.contentAnalysis && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      PDFs:
                    </span>
                    <p className="text-sm">{course.contentAnalysis.pdfCount}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Videos:
                    </span>
                    <p className="text-sm">
                      {course.contentAnalysis.videoCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Estimated Duration:
                    </span>
                    <p className="text-sm">
                      {course.contentAnalysis.estimatedDuration}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Course Content */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Course Content</h3>
        {course.notes && course.notes.length > 0 ? (
          <div className="space-y-4">
            {course.notes.map((note, index) => (
              <div key={note._id || index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      {note.fileType === "video" ? (
                        <Video className="h-4 w-4 text-blue-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{note.name}</h4>
                      {note.description && (
                        <p className="text-sm text-gray-600">
                          {note.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        {note.duration && (
                          <span className="text-xs text-gray-500">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {note.duration}
                          </span>
                        )}
                        {note.premium && (
                          <Badge variant="secondary" className="text-xs">
                            Premium
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {note.fileType?.toUpperCase() || "FILE"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {note.pdf && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open file in new tab
                          window.open(`${BASE_URL}${note.pdf}`, "_blank");
                        }}
                      >
                        {note.fileType === "video" ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No content available for this course.
          </div>
        )}
      </Card>

      {/* Additional Information */}
      {(course.tags?.length > 0 ||
        course.prerequisites?.length > 0 ||
        course.learningOutcomes?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {course.tags?.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {course.prerequisites?.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>• {prereq}</li>
                ))}
              </ul>
            </Card>
          )}

          {course.learningOutcomes?.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Learning Outcomes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index}>• {outcome}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Statistics */}
      {course.statistics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {course.statistics.likes}
              </div>
              <div className="text-sm text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {course.statistics.comments}
              </div>
              <div className="text-sm text-gray-500">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {course.statistics.enrollmentCount}
              </div>
              <div className="text-sm text-gray-500">Enrollments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {course.statistics.rating.average}
              </div>
              <div className="text-sm text-gray-500">
                Rating ({course.statistics.rating.count} reviews)
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{course.title}"? This action
              cannot be undone and will also delete all associated files.
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
