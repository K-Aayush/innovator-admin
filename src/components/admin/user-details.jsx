"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "");

const ITEMS_PER_PAGE = 5;

export function UserDetailsPage({ userId }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productDateFrom, setProductDateFrom] = useState("");
  const [productDateTo, setProductDateTo] = useState("");
  const [productCurrentPage, setProductCurrentPage] = useState(1);

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

  const filteredContent = user?.contents?.filter((content) => {
    const matchesSearch = content.status
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? content.type === selectedType : true;
    const contentDate = new Date(content.createdAt);
    const matchesDateFrom = dateFrom ? contentDate >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? contentDate <= new Date(dateTo) : true;

    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });

  const filteredProducts = user?.products?.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(productSearchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category._id === selectedCategory
      : true;
    const productDate = new Date(product.createdAt);
    const matchesDateFrom = productDateFrom
      ? productDate >= new Date(productDateFrom)
      : true;
    const matchesDateTo = productDateTo
      ? productDate <= new Date(productDateTo)
      : true;

    return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.ceil((filteredContent?.length || 0) / ITEMS_PER_PAGE);
  const totalProductPages = Math.ceil(
    (filteredProducts?.length || 0) / ITEMS_PER_PAGE
  );

  const paginatedContent = filteredContent?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginatedProducts = filteredProducts?.slice(
    (productCurrentPage - 1) * ITEMS_PER_PAGE,
    productCurrentPage * ITEMS_PER_PAGE
  );

  const contentTypes = [...new Set(user?.contents?.map((c) => c.type) || [])];
  const categories = [
    ...new Set(
      user?.products?.map((p) => ({
        id: p.category._id,
        name: p.category.name,
      })) || []
    ),
  ];

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
              <div className="flex items-center space-x-4">
                {user.user.picture && (
                  <img
                    src={`${BASE_URL}${user.user.picture}`}
                    alt={user.user.name}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                    }}
                  />
                )}
                <div>
                  <p>
                    <span className="font-medium">Name:</span> {user.user.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {user.user.email}
                  </p>
                </div>
              </div>
              <p>
                <span className="font-medium">Phone:</span> {user.user.phone}
              </p>
              <p>
                <span className="font-medium">Date of Birth:</span>{" "}
                {new Date(user.user.dob).toLocaleDateString()}
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
                <span className="font-medium">Level:</span>{" "}
                <Badge variant="secondary">{user.user.level}</Badge>
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

      {user.user.role === "user" && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">User Content</h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-md border border-input px-3 py-2"
                  >
                    <option value="">All Types</option>
                    {contentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("");
                    setDateFrom("");
                    setDateTo("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {paginatedContent?.length === 0 ? (
              <p className="text-gray-500">No content found</p>
            ) : (
              paginatedContent?.map((content) => (
                <div
                  key={content._id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Posted on {new Date(content.createdAt).toLocaleString()}
                      </p>
                      <Badge>{content.type}</Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setContentToDelete(content)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {content.status}
                  </p>
                  {content.files && content.files.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {content.files.map((file, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden"
                        >
                          <img
                            src={`${BASE_URL}${file}`}
                            alt={`Content ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      )}

      {user.user.role === "vendor" && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Products</h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value);
                        setProductCurrentPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setProductCurrentPage(1);
                    }}
                    className="w-full rounded-md border border-input px-3 py-2"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <Input
                    type="date"
                    value={productDateFrom}
                    onChange={(e) => {
                      setProductDateFrom(e.target.value);
                      setProductCurrentPage(1);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <Input
                    type="date"
                    value={productDateTo}
                    onChange={(e) => {
                      setProductDateTo(e.target.value);
                      setProductCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setProductSearchTerm("");
                    setSelectedCategory("");
                    setProductDateFrom("");
                    setProductDateTo("");
                    setProductCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts?.length === 0 ? (
              <p className="text-gray-500">No products found</p>
            ) : (
              paginatedProducts?.map((product) => (
                <Card key={product._id} className="p-4">
                  <div className="flex flex-col h-full">
                    {product.images && product.images.length > 0 && (
                      <div className="mb-4">
                        <img
                          src={`${BASE_URL}${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded"
                          onError={(e) => {
                            e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {product.category?.name || "No category"}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {product.description}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="font-semibold">${product.price}</span>
                        <span className="text-sm text-gray-500">
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {totalProductPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <Button
                onClick={() =>
                  setProductCurrentPage(Math.max(1, productCurrentPage - 1))
                }
                disabled={productCurrentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {productCurrentPage} of {totalProductPages}
              </span>
              <Button
                onClick={() =>
                  setProductCurrentPage(
                    Math.min(totalProductPages, productCurrentPage + 1)
                  )
                }
                disabled={productCurrentPage === totalProductPages}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      )}

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
