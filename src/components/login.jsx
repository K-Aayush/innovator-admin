"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginSchema } from "@/validation/schema";
import { authService } from "@/services/auth.service";
import { toast } from "@/components/ui/sonner";
import Image from "next/image";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const result = await authService.login(data);

      localStorage.setItem("token", result.accessToken);

      if (result.data.role === "admin") {
        router.push("/admin/dashboard");
        toast.success("Logged in successfully!");
      } else if (result.data.role === "vendor") {
        router.push("/vendor/dashboard");
        toast.success("Logged in successfully!");
      }
    } catch (err) {
      console.log("Login error:", err);
      if (err instanceof AxiosError && err.response) {
        //400, 401 and 500 error
        toast.error(err.response.error.error);
      } else if (err instanceof Error) {
        //unexpected errors
        toast.error(err.message || "An error occured while login");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-xl">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.jpg"
            alt="Innovator Logo"
            width={80}
            height={80}
            className="mb-6"
          />
          <h2 className="mt-2 text-center text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className={`${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-orange-500"
                } h-11`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                {...register("password")}
                type="password"
                placeholder="Enter your password"
                className={`${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-orange-500"
                } h-11`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-orange-500 hover:bg-orange-600 transition-colors duration-200 text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
