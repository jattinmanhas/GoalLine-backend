import { Router } from "express";
export const router = Router();
import { adminAuthRoute } from "./admin/auth/auth.route";
import { userAuthRoute } from "./user/auth/auth.route";
import { shopAdminRoute } from "./admin/shop/shop.route";

// ----------------------------    ADMIN ROUTES    -----------------------------------
router.use("/admin", adminAuthRoute);
router.use("/admin/shop", shopAdminRoute)

// ----------------------------    USER ROUTES    -----------------------------------
router.use("/user", userAuthRoute);