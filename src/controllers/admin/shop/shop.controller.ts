import { Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import { ApiError } from "../../../utils/handlers/apiError";
import { uploadFileToS3 } from "../../../services/s3Service";
import { ApiResponse } from "../../../utils/handlers/apiResponse";
import {
  categoryInsert,
  productImageMetadata,
  productInsert,
  UserPayload,
} from "../../../types/index.types";
import {
  createCategory,
  createProduct,
  insertProductImageMetadata,
} from "../../../services/shop.services";

export const addCategory = asyncHander(async (req: Request, res: Response) => {
  res.send("Add Category from the db....");
});

export const createNewCategory = asyncHander(
  async (req: Request, res: Response) => {
    const category_name = req.body.category_name;
    const category_description = req.body.category_description;

    if (!category_name) {
      throw new ApiError(400, "Category Name cannot be empty");
    }

    let user = req.user as UserPayload;
    let etag = "";
    let filename = "";

    if (req.file) {
      const fileKey = await uploadFileToS3(req.file);
      etag = fileKey.etag!;
      filename = fileKey.imageName;
    }

    let categoryData: categoryInsert = {
      category_name: category_name,
      category_description: category_description,
      imageName: filename,
      eTag: etag,
      isDeleted: 0,
      createdBy: user.id,
    };

    const category = await createCategory(categoryData);

    if (category.flag) {
      throw new ApiError(400, category.message);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, category, "New Category Created Successfully...")
      );
  }
);

export const createNewProduct = asyncHander(
  async (req: Request, res: Response) => {
    const product_name = req.body.product_name;
    const product_description = req.body.product_description;
    const product_price = req.body.product_price;
    const stock = req.body.stock;
    const category_id = req.body.category_id;
    const files = req.files as Express.Multer.File[];
    let user = req.user as UserPayload;

    const uploadedFiles: { imageName: string; etag: string | undefined }[] = [];

    if (req.files) {
      for (const file of files) {
        const fileKey = await uploadFileToS3(file);
        uploadedFiles.push(fileKey);
      }
    }

    let product_data: productInsert = {
      product_name: product_name,
      product_description: product_description,
      product_price: product_price,
      stock: stock,
      createdBy: user.id,
      category_id: category_id,
    };

    const createNewProduct = await createProduct(product_data);

    if (createNewProduct.flag) {
      throw new ApiError(400, createNewProduct.message);
    }

    for (const upload of uploadedFiles) {
      let productImage: productImageMetadata = {
        product_id: createNewProduct.data?.product_id as string,
        imageName: upload.imageName,
        etag: upload.etag as string,
      };

      const imageMeta = await insertProductImageMetadata(productImage);

      if (imageMeta.flag) {
        throw new ApiError(400, imageMeta.message);
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, createNewCategory, "New Product Created Successfully...")
      );
  }
);
