"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegistrationSchema = void 0;
const zod_1 = require("zod");
const UserRoleEnum = zod_1.z.enum(["ADMIN", "USER"]);
exports.RegistrationSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(20, { message: "Username cannot exceed 20 characters" }),
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    fullname: zod_1.z
        .string()
        .max(30, { message: "Full name cannot exceed 30 characters" }),
    password: zod_1.z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    mobileNo: zod_1.z
        .string()
        .regex(/^\d{10}$/, { message: "Mobile number must be 10 digits" })
        .optional(),
    role: UserRoleEnum.optional(),
});
exports.LoginSchema = zod_1.z
    .object({
    username: zod_1.z
        .string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(20, { message: "Username cannot exceed 20 characters" })
        .optional(),
    email: zod_1.z.string().email({ message: "Invalid email address" }).optional(),
    password: zod_1.z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
})
    .superRefine((data, ctx) => {
    if (!data.username && !data.email) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Either username or email is required",
            path: ["username"], // Can also include 'email'
        });
    }
});
