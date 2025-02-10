"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminBlog = void 0;
const express_1 = require("express");
const adminBlog_controller_1 = require("../../../controllers/admin/blog/adminBlog.controller");
const fileUpload_1 = require("../../../middleware/fileUpload");
const passport_1 = __importDefault(require("passport"));
exports.adminBlog = (0, express_1.Router)();
exports.adminBlog.post("/createBlog", passport_1.default.authenticate("jwt-admin", { session: false }), adminBlog_controller_1.createNewBlog);
exports.adminBlog.post("/BlogUploadS3", (0, fileUpload_1.singleFileUpload)("file"), adminBlog_controller_1.uploadBlogImageToS3);
exports.adminBlog.get("/blogsCount", passport_1.default.authenticate("jwt-admin", { session: false }), adminBlog_controller_1.getAllBlogsCount);
