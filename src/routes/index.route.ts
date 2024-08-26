import { Router } from "express";
export const router = Router();
import { adminAuthRoute } from "./admin/auth/auth.route";
import { userAuthRoute } from "./user/auth/auth.route";

// ----------------------------    ADMIN ROUTES    -----------------------------------
router.use("/admin", adminAuthRoute);

// ----------------------------    USER ROUTES    -----------------------------------
router.use("/user", userAuthRoute);