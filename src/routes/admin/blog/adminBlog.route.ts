import { Router } from "express";
import {
    createNewBlog,
    getAllBlogsCount,
    uploadBlogImageToS3
} from "../../../controllers/admin/blog/adminBlog.controller";
import { singleFileUpload } from "../../../middleware/fileUpload";
import passport from "passport";

export const adminBlog = Router();

adminBlog.post("/createBlog", passport.authenticate("jwt-admin", { session: false }), createNewBlog);
adminBlog.post("/BlogUploadS3", singleFileUpload("file"), uploadBlogImageToS3);
adminBlog.get("/blogsCount", passport.authenticate("jwt-admin", { session: false }), getAllBlogsCount);