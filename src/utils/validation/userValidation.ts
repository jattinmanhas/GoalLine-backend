import { z } from "zod";

const UserRoleEnum = z.enum(["ADMIN", "USER"]);

export const RegistrationSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username cannot exceed 20 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  fullname: z
    .string()
    .max(30, { message: "Full name cannot exceed 30 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  mobileNo: z
    .string()
    .regex(/^\d{10}$/, { message: "Mobile number must be 10 digits" })
    .optional(),
  role: UserRoleEnum.optional(),
});


export const LoginSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(20, { message: "Username cannot exceed 20 characters" })
      .optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
  })
  .superRefine((data, ctx) => {
    if (!data.username && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either username or email is required",
        path: ["username"], // Can also include 'email'
      });
    }
  });

type RegisterInput = z.infer<typeof RegistrationSchema>;
type LoginInput = z.infer<typeof LoginSchema>;
