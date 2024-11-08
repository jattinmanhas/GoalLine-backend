import { Router } from "express";
export const router = Router();
import { adminAuthRoute } from "./admin/auth/auth.route";
import { userAuthRoute } from "./user/auth/auth.route";
import { shopAdminRoute } from "./admin/shop/shop.route";
import { userShopRoute } from "./user/shop/shop.route";
import { userBlogRoute } from "./user/blog/UserBlog.route";
import { adminBlog } from "./admin/blog/adminBlog.route";
import { createContact, searchProductsBlogs } from "../controllers/user/contact/contact.controller";

// ----------------------------    ADMIN ROUTES    -----------------------------------
router.use("/admin", adminAuthRoute);
router.use("/admin/shop", shopAdminRoute)
router.use("/admin/blog", adminBlog);

// ----------------------------    USER ROUTES    -----------------------------------
router.use("/user", userAuthRoute);
router.use("/user/shop", userShopRoute);
router.use("/user/blog", userBlogRoute);

// ================================== QUERY ROUTE =========================================
router.use("/contact", createContact)
router.use("/searchBoth", searchProductsBlogs);