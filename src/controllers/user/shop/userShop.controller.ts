import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import {
  createCartForUser,
  createCartItemForUser,
  getAllCategoriesService,
  getAllProductsService,
  getSingleProductService,
  getUserCartDetails,
  getUserCartItem,
  searchProductsService,
  updateCartItemQuantity,
} from "../../../services/shop.services";
import { ApiError } from "../../../utils/handlers/apiError";
import { ApiResponse } from "../../../utils/handlers/apiResponse";
import { getSignedForImage } from "../../../services/s3Service";
import {
  categoryType,
  ProductImage,
  ProductType,
} from "../../../types/index.types";
import client from "../../../config/redisClient";

export const getAllCategories = asyncHander(
  async (req: Request, res: Response) => {
    let skip = 0;
    let take = 50;
    const redisHashKey = `categories`;
    if (req.query.skip) {
      skip = Number(req.query.skip);
    }

    if (req.query.take) {
      take = Number(req.query.take);
    }

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
            "Successfully Fetched Categories from redis"
          )
        );
    }

    const allCategories = await getAllCategoriesService(skip, take);

    if (allCategories.flag) throw new ApiError(400, allCategories.message);

    let categoriesWithSignedUrls: categoryType[] = [];
    if (allCategories.data) {
      categoriesWithSignedUrls = await Promise.all(
        allCategories.data.map(async (cate) => ({
          signedUrl: await getSignedForImage(cate.imageName!),
          ...cate,
        }))
      );
    }

    await client.hSet(
      redisHashKey,
      redisFieldKey,
      JSON.stringify(categoriesWithSignedUrls)
    );
    await client.expire(redisHashKey, 86400);
    return res
      .status(200)
      .json(
        new ApiResponse(200, categoriesWithSignedUrls, allCategories.message)
      );
  }
);

export const getAllProducts = asyncHander(
  async (req: Request, res: Response) => {
    let skip = 0;
    let take = 50;
    const redisHashKey = `products`;

    if (req.query.skip) {
      skip = Number(req.query.skip);
    }

    if (req.query.take) {
      take = Number(req.query.take);
    }

    const redisFieldKey = `${skip}:${take}`;

    const allProducts = await getAllProductsService(skip, take);

    const cachedData = await client.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
      console.log("cache hit");
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            JSON.parse(cachedData),
            "Successfully Fetched Products from redis"
          )
        );
    }

    if (allProducts.flag) throw new ApiError(400, allProducts.message);

    let productsWithSignedUrl: ProductType[] = [];

    if (allProducts.data) {
      productsWithSignedUrl = await Promise.all(
        allProducts.data.map(async (product) => {
          let images: ProductImage[] = [];
          if (product.images) {
            images = await Promise.all(
              product.images.map(async (image) => ({
                ...image,
                signedUrl: await getSignedForImage(image.imageName),
              }))
            );
          }
          return {
            ...product,
            images,
          };
        })
      );
    }

    await client.hSet(
      redisHashKey,
      redisFieldKey,
      JSON.stringify(productsWithSignedUrl)
    );
    await client.expire(redisHashKey, 86400);

    return res
      .status(200)
      .json(new ApiResponse(200, productsWithSignedUrl, allProducts.message));
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

    if (product.data == null) {
      throw new ApiError(404, "Product Not found.");
    }

    return res.status(200).json(new ApiResponse(200, product, product.message));
  }
);

export const searchProducts = asyncHander(
  async (req: Request, res: Response) => {
    const search = req.query.search as string;
    const skip = Number(req.query.skip);
    const take = Number(req.query.take);

    const searchProducts = await searchProductsService(search, skip, take);

    if (searchProducts.flag) {
      throw new ApiError(400, searchProducts.message);
    }

    if (searchProducts.data == null) {
      throw new ApiError(404, "Product Not found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, searchProducts.data, searchProducts.message));
  }
);

export const addToCart = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.body.user_id;
    const product_id = req.body.product_id;

    if (!user_id) {
      throw new ApiError(400, "User Details Not Found...");
    }

    if (!product_id) {
      throw new ApiError(400, "Product Details not found...");
    }

    // check if user have cart...
    const cartDetails = await getUserCartDetails(user_id);
    if (cartDetails.flag) {
      throw new ApiError(400, cartDetails.message);
    }

    let cart_id = cartDetails.data?.cart_id;

    if (!cartDetails.data) {
      const createCart = await createCartForUser(user_id);
      if (createCart.flag) throw new ApiError(400, createCart.message);
      cart_id = createCart.data?.cart_id;
    }

    const cartItem = await getUserCartItem(cart_id!, product_id);
    if (cartItem.flag) {
      throw new ApiError(400, cartItem.message);
    }

    if (cartItem.data) {
      const updateQty = await updateCartItemQuantity(
        cartItem.data.cart_items_id,
        cartItem.data.quantity
      );

      if (updateQty.flag) {
        throw new ApiError(400, updateQty.message);
      }

      return res
        .status(200)
        .json(new ApiResponse(200, updateQty.data, updateQty.message));
    }

    const createCartItem = await createCartItemForUser(product_id, cart_id!, 1);

    if (createCartItem.flag) {
      throw new ApiError(400, createCartItem.message);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createCartItem.data, createCartItem.message));
  }
);

export const updateQuantity = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const cart_items_id = req.body.cart_items_id;
    const quantity = req.body.quantity;

    if (!cart_items_id) {
      throw new ApiError(400, "Cart Items id Not found");
    }

    if (!quantity) {
      throw new ApiError(400, "Quantity Not found...");
    }

    const updateQty = await updateCartItemQuantity(
      cart_items_id,
      quantity
    );

    if (updateQty.flag) {
      throw new ApiError(400, updateQty.message);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updateQty.data, updateQty.message));
  }
);
