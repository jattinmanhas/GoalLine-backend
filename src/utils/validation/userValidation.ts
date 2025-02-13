import { z } from "zod";
import prisma from "../../config/prismaConfig";

export const RegistrationSchemaForAdmin = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .superRefine(async (username, ctx) => {
      try {
        const usernameExists = await prisma.user.findUnique({
          where: { username },
        });
        if (usernameExists) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Username already exists",
          });
        }
      } catch (error) {
        console.error("Error checking username:", error);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "An error occurred while validating the username",
        });
      }
    }),

  email: z
    .string()
    .email({ message: "Invalid email address" })
    .superRefine(async (email, ctx) => {
      try {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });
        if (emailExists) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Email already exists",
          });
        }
      } catch (error) {
        console.error("Error checking email:", error);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "An error occurred while validating the email",
        });
      }
    }),

  firstName: z
    .string()
    .min(2, { message: "First Name must be at least 2 characters long" })
    .max(30, { message: "First Name cannot exceed 30 characters" })
    .transform(
      (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
    ),

  middleName: z
    .string()
    .min(2, { message: "Middle Name must be at least 2 characters long" })
    .max(30, { message: "Middle Name cannot exceed 30 characters" })
    .optional()
    .transform((val) =>
      val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : val
    ),

  lastName: z
    .string()
    .min(2, { message: "Last Name must be at least 2 characters long" })
    .max(30, { message: "Last Name cannot exceed 30 characters" })
    .transform(
      (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
    ),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),

  mobileNo: z
    .string()
    .regex(/^\d{10}$/, { message: "Mobile number must be 10 digits" })
    .optional(),

  roleId: z.string().superRefine(async (roleId, ctx) => {
    try {
      const validRole = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!validRole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Role",
        });
      } else {
        if (validRole.name !== "ADMIN") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid Role",
          });
        }
      }
    } catch (error) {
      console.error("Error checking role:", error);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An error occurred while validating the role",
      });
    }
  }),
});

export const RegistrationSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .superRefine(async (username, ctx) => {
      try {
        const usernameExists = await prisma.user.findUnique({
          where: { username },
        });
        if (usernameExists) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Username already exists",
          });
        }
      } catch (error) {
        console.error("Error checking username:", error);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "An error occurred while validating the username",
        });
      }
    }),

  email: z
    .string()
    .email({ message: "Invalid email address" })
    .superRefine(async (email, ctx) => {
      try {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });
        if (emailExists) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Email already exists",
          });
        }
      } catch (error) {
        console.error("Error checking email:", error);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "An error occurred while validating the email",
        });
      }
    }),

  firstName: z
    .string()
    .min(2, { message: "First Name must be at least 2 characters long" })
    .max(30, { message: "First Name cannot exceed 30 characters" })
    .transform(
      (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
    ),

  middleName: z
    .string()
    .min(2, { message: "Middle Name must be at least 2 characters long" })
    .max(30, { message: "Middle Name cannot exceed 30 characters" })
    .optional()
    .transform((val) =>
      val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : val
    ),

  lastName: z
    .string()
    .min(2, { message: "Last Name must be at least 2 characters long" })
    .max(30, { message: "Last Name cannot exceed 30 characters" })
    .transform(
      (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
    ),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),

  mobileNo: z
    .string()
    .regex(/^\d{10}$/, { message: "Mobile number must be 10 digits" })
    .optional(),

  roleId: z.string().superRefine(async (roleId, ctx) => {
    try {
      const validRole = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!validRole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Role",
        });
      }else {
        if (validRole.name === "ADMIN") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid Role",
          });
        }
      }
    } catch (error) {
      console.error("Error checking role:", error);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An error occurred while validating the role",
      });
    }
  }),
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
  .superRefine(async (data, ctx) => {
    // Ensure either username or email is provided
    if (!data.username && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either username or email is required",
        path: ["username", "email"],
      });
      return;
    }

    // Validate username existence if provided
    if (data.username) {
      try {
        const user = await prisma.user.findUnique({
          where: { username: data.username },
        });
        if (!user) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Username does not exist",
            path: ["username"],
          });
        }
      } catch (error) {
        console.error("Error checking username:", error);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "An error occurred while validating the username",
          path: ["username"],
        });
      }
    }

    // Validate email existence if provided
    if (data.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: data.email },
        });
        if (!user) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Email does not exist",
            path: ["email"],
          });
        }
      } catch (error) {
        console.error("Error checking email:", error);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "An error occurred while validating the email",
          path: ["email"],
        });
      }
    }
  });
