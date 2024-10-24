import { Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import {
  getAllCategoriesService,
  getAllProductsService,
  getSingleProductService,
  searchProductsService,
} from "../../../services/shop.services";
import { ApiError } from "../../../utils/handlers/apiError";
import { ApiResponse } from "../../../utils/handlers/apiResponse";

export const getAllCategories = asyncHander(
  async (req: Request, res: Response) => {
    const allCategories = await getAllCategoriesService();

    if (allCategories.flag) throw new ApiError(400, allCategories.message);

    return res
      .status(200)
      .json(new ApiResponse(200, allCategories.data, allCategories.message));
  }
);

export const getAllProducts = asyncHander(
  async (req: Request, res: Response) => {
    const allProducts = await getAllProductsService();

    if (allProducts.flag) throw new ApiError(400, allProducts.message);

    return res
      .status(200)
      .json(new ApiResponse(200, allProducts.data, allProducts.message));
  }
);

export const getProductById = asyncHander(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      throw new ApiError(400, "Failed to find Product");
    }

    const product = await getSingleProductService(id);

    if (product.flag) {
      throw new ApiError(400, product.message);
    }

    if(product.data == null){
        throw new ApiError(404, "Product Not found.");
    }

    return res.status(200).json(new ApiResponse(200, product, product.message));
  }
);

export const searchProducts = asyncHander(async (req: Request, res: Response) => {
    const search = req.query.search as string;
    const skip = Number(req.query.skip);
    const take = Number(req.query.take);

    const searchProducts = await searchProductsService(search, skip, take);

    if(searchProducts.flag){
        throw new ApiError(400, searchProducts.message);
    }

     if (searchProducts.data == null) {
       throw new ApiError(404, "Product Not found.");
     }

     return res.status(200).json(new ApiResponse(200, searchProducts.data, searchProducts.message));
})