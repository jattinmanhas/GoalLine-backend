import { Router } from "express";
import { login, register } from "../../../controllers/admin/auth/auth.controller";
import { validateRequest } from "../../../middleware/validationMiddleware";
import { RegistrationSchema } from "../../../utils/validation/userValidation";

export const adminAuthRoute = Router();

adminAuthRoute.post("/login", login)
adminAuthRoute.post("/register", validateRequest(RegistrationSchema), register);