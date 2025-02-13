import { z } from "zod";
import prisma from "../../config/prismaConfig";

export const categoryValidation = z.object({
  category_name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters long" })
    .max(20, { message: "Category name cannot exceed 20 characters" })
    .superRefine(async (category_name, ctx) => {
      try {
        const categoryExists = await prisma.category.findFirst({
          where: { name: category_name, isDeleted: false },
        });
        if (categoryExists) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Category already exists",
          });
        }
      } catch (error) {
        console.error("Error checking category name:", error);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "An error occurred while validating the category name",
        });
      }
    }),
  category_description: z
    .string()
    .min(5, { message: "Category description must be at least 5 characters long" })
    .max(300, { message: "Category description cannot exceed 300 characters" })
    .optional(),
});

export const productValidation = z.object({
  product_name: z
    .string()
    .min(2, { message: "Product name must be at least 2 characters long" })
    .max(200, { message: "Product name cannot exceed 200 characters" }),
  product_description: z
    .string()
    .min(5, { message: "Product description must be at least 5 characters long" })
    .max(600, { message: "Product description cannot exceed 600 characters" })
    .optional(),
  product_price: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    },
    z.number().positive({ message: "Product price must be a positive number" })
  ).transform((val) => parseFloat(val as unknown as string)),
  stock: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    },
    z.number().int().positive({ message: "Stock must be a positive integer" })
  ).transform((val) => parseInt(val as unknown as string, 10)),
  category_id: z.string().superRefine(async (category_id, ctx) => {
    try {
      const validCategory = await prisma.category.findFirst({
        where: { category_id: category_id, isDeleted: false },
      });

      if (!validCategory) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Category",
        });
      }
    } catch (error) {
      console.error("Error checking category:", error);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An error occurred while validating the category",
      });
    }
  }),
});