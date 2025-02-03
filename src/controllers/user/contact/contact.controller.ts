import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import {
  createContactService,
  searbhProductsCategoriesService,
} from "../../../services/contact.service";
import { ApiError } from "../../../utils/handlers/apiError";
import { ApiResponse } from "../../../utils/handlers/apiResponse";
import { getSignedForImagesUsingCloudFront } from "../../../services/s3Service";

export const createContact = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    const contact = await createContactService(email, subject, message);
    if (contact.flag) {
      throw new ApiError(400, (await contact).message);
    }

    return res.status(200).json(new ApiResponse(200, contact, contact.message));
  }
);

export const searchProductsBlogs = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      throw new ApiError(400, "Search query is required.");
    }

    const search = await searbhProductsCategoriesService(query);
    if (search.flag) {
      throw new ApiError(400, search.message);
    }

    search.data?.blogs.forEach(async (blog) => {
      if (blog.mainImage) {
        blog.mainImage = await getSignedForImagesUsingCloudFront(blog.mainImage);
      }
    });

    // Update products with signed URLs
    if (search.data?.products) {
      for (const product of search.data.products) {
        product.images = await Promise.all(
          product.images.map(async (image) => ({
            ...image,
            imageName: await getSignedForImagesUsingCloudFront(image.imageName),
          }))
        );
      }
    }
    return res
      .status(200)
      .json(new ApiResponse(200, search.data, search.message));
  }
);
