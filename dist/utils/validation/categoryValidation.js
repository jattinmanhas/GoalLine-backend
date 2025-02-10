"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = exports.CategorySchema = void 0;
const zod_1 = require("zod");
exports.CategorySchema = zod_1.z.object({
    category_name: zod_1.z.string().min(3, { message: "Category Name must be at least 3 characters long." })
});
exports.ProductSchema = zod_1.z.object({
    product_name: zod_1.z
        .string()
        .min(3, { message: "Product Name must be at least 3 characters long." })
        .max(100, { message: "Product Name cannot exceed 100 words." }),
    category_id: zod_1.z.string().uuid("Invalid Category ID"),
    product_price: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => Number(val))
        .refine((val) => val > 0, { message: "Price must be a positive number." }),
    stock: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => Number(val))
        .refine((val) => Number.isInteger(val) && val >= 0, {
        message: "Stock must be a non-negative integer",
    }),
});
