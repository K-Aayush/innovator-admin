"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { vendorService } from "@/services/vendor.service";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProductDetails({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await vendorService.getSingleProduct(id);
        setProduct(response.data);
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
        <Button className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
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
        <h1 className="text-2xl font-semibold">Product Details</h1>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h2>
              <p className="text-lg text-gray-500">{product.category?.name}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {product.content && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Content</h3>
                <p className="text-gray-600">{product.content}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${product.price}</span>
                <div className="bg-gray-100 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
