import { z } from "zod";

const UserRoleEnum = z.enum(["ADMIN", "USER"]);

export const RegistrationSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  fullname: z.string().max(30),
  password: z.string().min(6),
  mobileNo: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  role: UserRoleEnum.optional(),
});

type RegisterInput = z.infer<typeof RegistrationSchema>