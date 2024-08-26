import { Router } from "express";
import { login, register } from "../../../controllers/admin/auth/auth.controller";
import { validateRequest } from "../../../middleware/validationMiddleware";
import { LoginSchema, RegistrationSchema } from "../../../utils/validation/userValidation";

export const adminAuthRoute = Router();

adminAuthRoute.post("/login", validateRequest(LoginSchema), login)
adminAuthRoute.post("/register", validateRequest(RegistrationSchema), register);