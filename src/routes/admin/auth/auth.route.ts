import { Router } from "express";
import {getAllUsers, login, register, getAllUsersCount} from "../../../controllers/admin/auth/auth.controller";
import { validateRequest } from "../../../middleware/validationMiddleware";
import { LoginSchema, RegistrationSchema } from "../../../utils/validation/userValidation";
import passport from "passport";

export const adminAuthRoute = Router();

adminAuthRoute.post("/login", validateRequest(LoginSchema), login)
adminAuthRoute.post("/register", validateRequest(RegistrationSchema), register);
adminAuthRoute.get("/userList", passport.authenticate("jwt-admin", { session: false }), getAllUsers);
adminAuthRoute.get("/usersCount", passport.authenticate("jwt-admin", { session: false }), getAllUsersCount);
