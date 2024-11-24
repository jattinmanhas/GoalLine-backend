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
router.use("/api/admin", adminAuthRoute);
router.use("/api/admin/shop", shopAdminRoute)
router.use("/api/admin/blog", adminBlog);

// ----------------------------    USER ROUTES    -----------------------------------
router.use("/api/user", userAuthRoute);
router.use("/api/user/shop", userShopRoute);
router.use("/api/user/blog", userBlogRoute);

// ================================== QUERY ROUTE =========================================
router.use("/api/contact", createContact)
router.use("/api/searchBoth", searchProductsBlogs);