import { z } from "zod";

export const CategorySchema = z.object({
    category_name: z.string().min(3, {message: "Category Name must be at least 3 characters long."})
})

export const ProductSchema = z.object({
  product_name: z
    .string()
    .min(3, { message: "Product Name must be at least 3 characters long." })
    .max(100, { message: "Product Name cannot exceed 100 words." }),
  category_id: z.string().uuid("Invalid Category ID"),
  product_price: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, { message: "Price must be a positive number." }),
  stock: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val >= 0, {
      message: "Stock must be a non-negative integer",
    }),
});