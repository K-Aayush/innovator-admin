"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";

export function UserDetailsPage({ userId }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserDetails(userId);
      setUser(response.data);
    } catch (error) {
      toast.error("Failed to fetch user details");
      router.push("/admin/dashboard/users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const handleDeleteContent = async () => {
    if (!contentToDelete || !deleteReason) return;

    try {
      await adminService.deleteContent({
        contentId: contentToDelete._id,
        reason: deleteReason,
      });
      toast.success("Content deleted successfully");
      setContentToDelete(null);
      setDeleteReason("");
      fetchUserDetails();
    } catch (error) {
      toast.error("Failed to delete content");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">User not found</h2>
        <Button
          className="mt-4"
          onClick={() => router.push("/admin/dashboard/users")}
        >
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-semibold">User Details</h1>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {user.user.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.user.email}
              </p>
              <p>
                <span className="font-medium">Role:</span>{" "}
                <Badge
                  variant={
                    user.user.role === "admin"
                      ? "destructive"
                      : user.user.role === "vendor"
                      ? "secondary"
                      : "default"
                  }
                >
                  {user.user.role}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {user.user.banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge variant="default">Active</Badge>
                )}
              </p>
              {user.user.banned && (
                <div>
                  <p>
                    <span className="font-medium">Ban Reason:</span>{" "}
                    {user.user.banReason}
                  </p>
                  <p>
                    <span className="font-medium">Ban Ends:</span>{" "}
                    {new Date(user.user.banEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {user.user.role === "vendor" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Business Information
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Business Name:</span>{" "}
                  {user.user.businessName}
                </p>
                <p>
                  <span className="font-medium">Business Description:</span>{" "}
                  {user.user.businessDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">User Content</h2>
        <div className="space-y-4">
          {user.contents.length === 0 ? (
            <p className="text-gray-500">No content found</p>
          ) : (
            user.contents.map((content) => (
              <div
                key={content._id}
                className="border rounded-lg p-4 flex justify-between items-start"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    Posted on {new Date(content.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2">{content.text}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setContentToDelete(content)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      <AlertDialog
        open={!!contentToDelete}
        onOpenChange={() => setContentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Reason for Deletion
              </label>
              <Input
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deletion"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteContent}
            >
              Delete Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
