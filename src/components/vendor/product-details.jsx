"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { vendorService } from "@/services/vendor.service";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function ProductDetails({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await vendorService.getSingleProduct(id);
        setProduct(response.data);
        setSelectedImage(response.data.images?.[0] || null);
      } catch (error) {
        toast.error("Failed to fetch product details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Product not found
        </h2>
        <Button
          className="mt-4 bg-orange-500 hover:bg-orange-600"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-4">
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">
          Product Details
        </h1>
      </div>

      <Card className="p-6 shadow-lg rounded-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <div className="max-w-sm aspect-square overflow-hidden rounded-lg border border-gray-200 mx-auto">
                <img
                  src={
                    selectedImage
                      ? `${BASE_URL}${selectedImage}`
                      : `${BASE_URL}/public/fallback-image.jpg`
                  }
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                    console.error("Image failed to load:", selectedImage);
                  }}
                />
              </div>
            ) : (
              <div className="max-w-sm aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 mx-auto">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-sm mx-auto">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedImage === image
                        ? "border-orange-500"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={`${BASE_URL}${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                      onError={(e) => {
                        e.target.src = `${BASE_URL}/public/fallback-image.jpg`;
                        console.error("Thumbnail failed to load:", image);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {product.name}
              </h2>
              <p className="mt-1">
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {product.category?.name || "No category"}
                </Badge>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed first-letter:capitalize">
                {product.description || "No description available"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">Content</h3>
              {product.content && product.content.trim() ? (
                <ul className="text-gray-600 leading-relaxed list-disc pl-5">
                  {product.content.split("\n").map((item, index) => (
                    <li key={index} className="first-letter:capitalize">
                      {item.startsWith("- ")
                        ? item.slice(2).trim()
                        : item.trim()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  No content available
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg shadow-sm hover:bg-green-100 transition-colors duration-200">
                  <span className="text-2xl font-bold tracking-tight">
                    NPR {product.price}
                  </span>
                </div>
                <div className="border border-orange-500 text-orange-500 px-4 py-2 rounded-full font-medium hover:bg-orange-50 transition-colors duration-200">
                  <span className="text-sm">Stock: {product.stock}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
