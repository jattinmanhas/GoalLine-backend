import { Router } from "express";
import { getAllBlogsList, getSingleBlogById } from "../../../controllers/user/blog/userBlog.controller";

export const userBlogRoute = Router();

userBlogRoute.get("/singleBlog/:blogId", getSingleBlogById);
userBlogRoute.get("/getAllBlogs", getAllBlogsList);