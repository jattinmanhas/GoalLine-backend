import { Router } from "express";
import {getAllUsers, register, getAllUsersCount, Adminlogin, logoutAdmin} from "../../../controllers/admin/auth/auth.controller";
import { validateRequest } from "../../../middleware/validationMiddleware";
import { LoginSchema, RegistrationSchemaForAdmin } from "../../../utils/validation/userValidation";
import passport from "passport";
import { authenticationMiddleware } from "../../../middleware/authMiddleware";

export const adminAuthRoute = Router();

adminAuthRoute.post("/login", validateRequest(LoginSchema), Adminlogin)
adminAuthRoute.post("/register", validateRequest(RegistrationSchemaForAdmin), register);
adminAuthRoute.post("/logout", logoutAdmin);
adminAuthRoute.get("/userList", authenticationMiddleware, getAllUsers);
adminAuthRoute.get("/usersCount", authenticationMiddleware, getAllUsersCount);
