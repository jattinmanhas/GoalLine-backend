import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import { ApiError } from "../../../utils/handlers/apiError";
import {
  getAllBlogsService,
  getBlogWithSections,
} from "../../../services/blog.services";
import { ApiResponse } from "../../../utils/handlers/apiResponse";
import client from "../../../config/redisClient";

export const getSingleBlogById = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const blogId = req.params.blogId;
    const redisHashKey = `blogs`;

    if (!blogId) {
      throw new ApiError(404, "Blog Id not Found");
    }
    const redisFieldKey = `${blogId}`;

    const cachedData = await client.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
      console.log("cache hit");
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            JSON.parse(cachedData),
            "Successfully Fetched Blog from redis"
          )
        );
    }

    const blog = await getBlogWithSections(blogId);
    if (blog.flag) {
      throw new ApiError(400, blog.message);
    }

    await client.hSet(redisHashKey, redisFieldKey, JSON.stringify(blog.data));
    await client.expire(redisHashKey, 86400);

    return res.status(200).json(new ApiResponse(200, blog.data, blog.message));
  }
);

export const getAllBlogsList = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;
    const redisHashKey = `blogs`;
    const redisFieldKey = `${skip}:${take}`;

    const cachedData = await client.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
      console.log("cache hit");
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            JSON.parse(cachedData),
            "Successfully Fetched Blogs from redis"
          )
        );
    }

    const blog = await getAllBlogsService(skip, take);
    if (blog.flag) {
      throw new ApiError(400, blog.message);
    }

    await client.hSet(redisHashKey, redisFieldKey, JSON.stringify(blog.data));
    await client.expire(redisHashKey, 86400);

    return res.status(200).json(new ApiResponse(200, blog.data, blog.message));
  }
);
