import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, "Price must be a positive number"),
  stock: z
    .string()
    .min(1, "Stock is required")
    .transform((val) => parseInt(val))
    .refine(
      (val) => !isNaN(val) && val >= 0,
      "Stock must be a non-negative number"
    ),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.any().optional(),
});

export const vendorSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(1, "Business name is required"),
  businessDescription: z.string().min(1, "Business description is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  dob: z.string().min(1, "Date of birth is required"),
});

export const courseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  language: z.string().optional(),
  duration: z.string().optional(),
  price: z.object({
    usd: z
      .string()
      .min(1, "USD price is required")
      .transform((val) => parseFloat(val))
      .refine(
        (val) => !isNaN(val) && val >= 0,
        "USD price must be non-negative"
      ),
    npr: z
      .string()
      .min(1, "NPR price is required")
      .transform((val) => parseFloat(val))
      .refine(
        (val) => !isNaN(val) && val >= 0,
        "NPR price must be non-negative"
      ),
  }),
  tags: z.string().optional(),
  prerequisites: z.string().optional(),
  learningOutcomes: z.string().optional(),
});

export const courseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentCategory: z.string().optional(),
  sortOrder: z.number().optional(),
});
