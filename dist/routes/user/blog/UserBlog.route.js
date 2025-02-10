"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userBlogRoute = void 0;
const express_1 = require("express");
const userBlog_controller_1 = require("../../../controllers/user/blog/userBlog.controller");
exports.userBlogRoute = (0, express_1.Router)();
exports.userBlogRoute.get("/singleBlog/:blogId", userBlog_controller_1.getSingleBlogById);
exports.userBlogRoute.get("/getAllBlogs", userBlog_controller_1.getAllBlogsList);
