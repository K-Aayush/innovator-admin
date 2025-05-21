"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema } from "@/validation/schema";

export function AddVendorPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await adminService.addVendor(data);
      toast.success("Vendor added successfully");
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add New Vendor</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                {...register("email")}
                type="email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                {...register("password")}
                type="password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Business Name
              </label>
              <Input
                {...register("businessName")}
                className={errors.businessName ? "border-red-500" : ""}
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Business Description
              </label>
              <Input
                {...register("businessDescription")}
                className={errors.businessDescription ? "border-red-500" : ""}
              />
              {errors.businessDescription && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.businessDescription.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date of Birth
              </label>
              <Input
                {...register("dob")}
                type="date"
                className={errors.dob ? "border-red-500" : ""}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.dob.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </div>
              ) : (
                "Add Vendor"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
