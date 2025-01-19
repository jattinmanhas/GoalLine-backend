import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import { uploadFileToS3 } from "../../../services/s3Service";
import { ApiError } from "../../../utils/handlers/apiError";
import { ApiResponse } from "../../../utils/handlers/apiResponse";
import { BlogSection, UserPayload } from "../../../types/index.types";
import {
    createNewBlogSection,
    createNewBlogSectionImage,
    createNewBlogService, getBlogsCountService,
} from "../../../services/blog.services";
import client from "../../../config/redisClient";

export const createNewBlog = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    let heading = req.body.heading;
    let description = req.body.description;
    let imageName = null;
    if (req.body.image) {
      imageName = req.body.image;
    }
    let category_id = req.body.category_id;
    let author = req.user as UserPayload;
    let sections: BlogSection[] = req.body.sections;

    const createBlog = await createNewBlogService(
      heading,
      description,
      imageName,
      category_id,
      author.id
    );

    if (createBlog.flag) {
      throw new ApiError(400, createBlog.message);
    }

    if (sections.length >= 1) {
      for (const section of sections) {
        let data = {
          id: section.id,
          heading: section.heading,
          paragraph: section.paragraph,
          order: Number(section.id),
          blogId: createBlog.data?.id!,
        };

        const createSection = await createNewBlogSection(data);
        if (createSection.flag) {
          throw new ApiError(400, createSection.message);
        }

        if (section.image?.imageName && createSection.data?.id) {
          const createSectionImage = await createNewBlogSectionImage(
            section.image?.imageName,
            createSection.data?.id!
          );

          if (createSectionImage.flag) {
            throw new ApiError(400, createSectionImage.message);
          }
        }
      }
    }

    await client.del("blogs");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          createBlog.data,
          "New Blog Created Successfully..."
        )
      );
  }
);

export const uploadBlogImageToS3 = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    let etag = "";
    let filename = "";

    if (!req.file) {
      throw new ApiError(404, "File not found");
    }

    const fileKey = await uploadFileToS3(req.file, "blog");
    etag = fileKey.etag!;
    filename = fileKey.imageName;

    return res
      .status(200)
      .json(
        new ApiResponse(200, filename, "Image Successfully uploaded to the S3")
      );
  }
);

export const getAllBlogsCount = asyncHander(async (req: Request, res: Response, next: NextFunction) => {
    const blogsCount = await getBlogsCountService();
    if(blogsCount.flag){
        throw new ApiError(404, "Blog count not found");
    }

    return res.status(200).json(new ApiResponse(200, blogsCount.data, blogsCount.message));
})