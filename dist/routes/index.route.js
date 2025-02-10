"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
exports.router = (0, express_1.Router)();
const auth_route_1 = require("./admin/auth/auth.route");
const auth_route_2 = require("./user/auth/auth.route");
const shop_route_1 = require("./admin/shop/shop.route");
const shop_route_2 = require("./user/shop/shop.route");
const UserBlog_route_1 = require("./user/blog/UserBlog.route");
const adminBlog_route_1 = require("./admin/blog/adminBlog.route");
const contact_controller_1 = require("../controllers/user/contact/contact.controller");
// ----------------------------    ADMIN ROUTES    -----------------------------------
exports.router.use("/api/admin", auth_route_1.adminAuthRoute);
exports.router.use("/api/admin/shop", shop_route_1.shopAdminRoute);
exports.router.use("/api/admin/blog", adminBlog_route_1.adminBlog);
// ----------------------------    USER ROUTES    -----------------------------------
exports.router.use("/api/user", auth_route_2.userAuthRoute);
exports.router.use("/api/user/shop", shop_route_2.userShopRoute);
exports.router.use("/api/user/blog", UserBlog_route_1.userBlogRoute);
// ================================== QUERY ROUTE =========================================
exports.router.use("/api/contact", contact_controller_1.createContact);
exports.router.use("/api/searchBoth", contact_controller_1.searchProductsBlogs);
