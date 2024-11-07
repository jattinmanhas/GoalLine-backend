import { NextFunction, Request, Response } from "express";
import { asyncHander } from "../../../utils/handlers/asyncHander";
import {
  createCartItemForUser,
  deleteItemFromUserCartService,
  getAllCategoriesService,
  getAllProductInCategoryService,
  getAllProductsService,
  GetSignedProductsImageUrl,
  getSingleProductService,
  getUserAllCartItems,
  getUserAllCartItemsCount,
  getUserCartItem,
  searchCategoriesService,
  searchProductsService,
  updateCartItemQuantity,
  updateCartItemQuantityWithCartItemId,
} from "../../../services/shop.services";
import { ApiError } from "../../../utils/handlers/apiError";
import { ApiResponse } from "../../../utils/handlers/apiResponse";
import { getSignedForImage } from "../../../services/s3Service";
import {
  categoryType,
  ProductImage,
  ProductType,
  UserPayload,
} from "../../../types/index.types";
import client from "../../../config/redisClient";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new ApiError(400, "Stripe Key not found.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const allProducts = await getAllProductsService(skip, take);
    if (allProducts.flag) throw new ApiError(400, allProducts.message);

    let productsWithSignedUrl: ProductType[] = [];

    if (allProducts.data) {
      productsWithSignedUrl = await GetSignedProductsImageUrl(allProducts.data);
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

    return res
      .status(200)
      .json(new ApiResponse(200, product.data, product.message));
  }
);

export const searchCategories = asyncHander(
  async (req: Request, res: Response) => {
    const search = req.query.query as string;
    const take = Number(req.query.take);

    const searchCat = await searchCategoriesService(search, take);

    if (searchCat.flag) {
      throw new ApiError(400, searchCat.message);
    }

    if (searchCat.data == null) {
      throw new ApiError(404, "Category Not found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, searchCat.data, searchCat.message));
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

    let productsWithSignedUrl: ProductType[] = [];

    if (searchProducts.data) {
      productsWithSignedUrl = await GetSignedProductsImageUrl(
        searchProducts.data
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, productsWithSignedUrl, searchProducts.message)
      );
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

    const cartItem = await getUserCartItem(user_id, product_id);
    if (cartItem.flag) {
      throw new ApiError(400, cartItem.message);
    }

    if (cartItem.data) {
      const updateQty = await updateCartItemQuantityWithCartItemId(
        cartItem.data.cart_items_id,
        cartItem.data.quantity + 1
      );

      if (updateQty.flag) {
        throw new ApiError(400, updateQty.message);
      }

      return res
        .status(200)
        .json(new ApiResponse(200, updateQty.data, updateQty.message));
    }

    const createCartItem = await createCartItemForUser(product_id, user_id, 1);

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
    const user_id = req.body.user_id;
    const product_id = req.body.product_id;
    const quantity = req.body.quantity;

    if (!product_id) {
      throw new ApiError(404, "Product Not found");
    }

    if (!user_id) {
      throw new ApiError(404, "User Details Not found");
    }

    if (!quantity) {
      throw new ApiError(404, "Quantity Not found...");
    }

    const updateQty = await updateCartItemQuantity(
      user_id,
      product_id,
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

export const getUserCartItemFromUserId = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const redisHashKey = `user:${userId}`;
    const redisFieldKey = `cart`;

    const cachedData = await client.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
      console.log("cache hit");
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            JSON.parse(cachedData),
            "Successfully Fetched CartItems from redis"
          )
        );
    }

    const cartItems = await getUserAllCartItems(userId);
    if (cartItems.flag) {
      throw new ApiError(400, cartItems.message);
    }

    await client.hSet(redisHashKey, redisFieldKey, JSON.stringify(cartItems));
    await client.expire(redisHashKey, 86400);

    return res
      .status(200)
      .json(new ApiResponse(200, cartItems.data, cartItems.message));
  }
);

export const deleteItemFromUserCart = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const product_id = req.params.productId;
    const userId = req.params.userId;

    const redisHashKey = `user:${userId}`;
    const redisFieldKey = `cart`;

    if (!product_id) {
      throw new ApiError(400, "Failed to find Product.");
    }

    const deleteItem = await deleteItemFromUserCartService(userId, product_id);
    if (deleteItem.flag) {
      throw new ApiError(400, deleteItem.message);
    }

    const userCartItems = await getUserAllCartItems(userId);
    if (userCartItems.flag) {
      throw new ApiError(400, userCartItems.message);
    }

    await client.hSet(
      redisHashKey,
      redisFieldKey,
      JSON.stringify(userCartItems)
    );
    await client.expire(redisHashKey, 86400);

    return res
      .status(200)
      .json(new ApiResponse(200, deleteItem.data, deleteItem.message));
  }
);

export const getUserCartItemsCount = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const count = await getUserAllCartItemsCount(userId);
    if (count.flag) {
      throw new ApiError(400, count.message);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, count.data, count.message));
  }
);

export const getAllProductInCategory = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    const category_id = req.params.categoryId;
    const take = Number(req.query.take) || 10;
    const skip = Number(req.query.skip) || 0;
    if (!category_id) {
      throw new ApiError(404, "Failed to Find Category Id");
    }
    const redisHashKey = `category:${category_id}`;
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

    const getAllProducts = await getAllProductInCategoryService(
      category_id,
      skip,
      take
    );

    if (getAllProducts.flag) throw new ApiError(400, getAllProducts.message);

    let productsWithSignedUrl: ProductType[] = [];

    if (getAllProducts.data) {
      productsWithSignedUrl = await GetSignedProductsImageUrl(
        getAllProducts.data
      );
    }

    await client.hSet(
      redisHashKey,
      redisFieldKey,
      JSON.stringify(productsWithSignedUrl)
    );
    await client.expire(redisHashKey, 60 * 60 * 1000);

    return res
      .status(200)
      .json(
        new ApiResponse(200, productsWithSignedUrl, getAllProducts.message)
      );
  }
);

export const createStripeSession = asyncHander(
  async (req: Request, res: Response, next: NextFunction) => {
    let products = req.body.products;
    let user = (req.user) as UserPayload;

    const metadata = {
      email: user.email,
      productIds: products
        .map((product: any) => `${product.product_id}:${product.quantity}`)
        .join(","), // Format: "productId1:quantity1,productId2:quantity2"
      userId: user.id,
    };

    console.log(metadata)

    const lineItems = products.map((product: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: [product.images[0].signedUrl],
        },
        unit_amount: Number(product.price) * 100,
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: user.email,
      mode: "payment",
      metadata: metadata,
      success_url: "http://localhost:3000/shop/payments/success",
      cancel_url: "http://localhost:3000/shop/payments/cancel",
    });

    res
      .status(200)
      .json(new ApiResponse(200, session.id, "Payment Successful"));
  }
);
