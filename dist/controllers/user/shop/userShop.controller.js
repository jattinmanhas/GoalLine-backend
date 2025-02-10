"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrdersWithPayments = exports.createStripeSession = exports.getAllProductInCategory = exports.getUserCartItemsCount = exports.deleteItemFromUserCart = exports.getUserCartItemFromUserId = exports.updateQuantity = exports.addToCart = exports.searchProducts = exports.searchCategories = exports.getProductById = exports.getAllProducts = exports.getAllCategories = void 0;
const asyncHander_1 = require("../../../utils/handlers/asyncHander");
const shop_services_1 = require("../../../services/shop.services");
const apiError_1 = require("../../../utils/handlers/apiError");
const apiResponse_1 = require("../../../utils/handlers/apiResponse");
const s3Service_1 = require("../../../services/s3Service");
const redisClient_1 = __importDefault(require("../../../config/redisClient"));
const stripe_1 = __importDefault(require("stripe"));
if (!process.env.STRIPE_SECRET_KEY) {
    throw new apiError_1.ApiError(400, "Stripe Key not found.");
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
exports.getAllCategories = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let skip = 0;
    let take = 100000;
    const redisHashKey = `categories`;
    if (req.query.skip) {
        skip = Number(req.query.skip);
    }
    if (req.query.take) {
        take = Number(req.query.take);
    }
    const redisFieldKey = `${skip}:${take}`;
    const cachedData = yield redisClient_1.default.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
        console.log("cache hit");
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, JSON.parse(cachedData), "Successfully Fetched Categories from redis"));
    }
    const allCategories = yield (0, shop_services_1.getAllCategoriesService)(skip, take);
    if (allCategories.flag)
        throw new apiError_1.ApiError(400, allCategories.message);
    let categoriesWithSignedUrls = [];
    if (allCategories.data) {
        categoriesWithSignedUrls = yield Promise.all(allCategories.data.map((cate) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign({ signedUrl: yield (0, s3Service_1.getSignedForImagesUsingCloudFront)(cate.imageName) }, cate));
        })));
    }
    yield redisClient_1.default.hSet(redisHashKey, redisFieldKey, JSON.stringify(categoriesWithSignedUrls));
    yield redisClient_1.default.expire(redisHashKey, 86400);
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, categoriesWithSignedUrls, allCategories.message));
}));
exports.getAllProducts = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let skip = 0;
    let take = 100000;
    const redisHashKey = `products`;
    if (req.query.skip) {
        skip = Number(req.query.skip);
    }
    if (req.query.take) {
        take = Number(req.query.take);
    }
    const redisFieldKey = `${skip}:${take}`;
    const cachedData = yield redisClient_1.default.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
        console.log("cache hit");
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, JSON.parse(cachedData), "Successfully Fetched Products from redis"));
    }
    const allProducts = yield (0, shop_services_1.getAllProductsService)(skip, take);
    if (allProducts.flag)
        throw new apiError_1.ApiError(400, allProducts.message);
    let productsWithSignedUrl = [];
    if (allProducts.data) {
        productsWithSignedUrl = yield (0, shop_services_1.GetSignedProductsImageUrl)(allProducts.data);
    }
    yield redisClient_1.default.hSet(redisHashKey, redisFieldKey, JSON.stringify(productsWithSignedUrl));
    yield redisClient_1.default.expire(redisHashKey, 86400);
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, productsWithSignedUrl, allProducts.message));
}));
exports.getProductById = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        throw new apiError_1.ApiError(400, "Failed to find Product");
    }
    const product = yield (0, shop_services_1.getSingleProductService)(id);
    if (product.flag) {
        throw new apiError_1.ApiError(400, product.message);
    }
    if (product.data == null) {
        throw new apiError_1.ApiError(404, "Product Not found.");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, product.data, product.message));
}));
exports.searchCategories = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.query.query;
    const take = Number(req.query.take);
    const searchCat = yield (0, shop_services_1.searchCategoriesService)(search, take);
    if (searchCat.flag) {
        throw new apiError_1.ApiError(400, searchCat.message);
    }
    if (searchCat.data == null) {
        throw new apiError_1.ApiError(404, "Category Not found.");
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, searchCat.data, searchCat.message));
}));
exports.searchProducts = (0, asyncHander_1.asyncHander)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.query.search;
    const skip = Number(req.query.skip);
    const take = Number(req.query.take);
    const searchProducts = yield (0, shop_services_1.searchProductsService)(search, skip, take);
    if (searchProducts.flag) {
        throw new apiError_1.ApiError(400, searchProducts.message);
    }
    if (searchProducts.data == null) {
        throw new apiError_1.ApiError(404, "Product Not found.");
    }
    let productsWithSignedUrl = [];
    if (searchProducts.data) {
        productsWithSignedUrl = yield (0, shop_services_1.GetSignedProductsImageUrl)(searchProducts.data);
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, productsWithSignedUrl, searchProducts.message));
}));
exports.addToCart = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.body.user_id;
    const product_id = req.body.product_id;
    if (!user_id) {
        throw new apiError_1.ApiError(400, "User Details Not Found...");
    }
    if (!product_id) {
        throw new apiError_1.ApiError(400, "Product Details not found...");
    }
    const cartItem = yield (0, shop_services_1.getUserCartItem)(user_id, product_id);
    if (cartItem.flag) {
        throw new apiError_1.ApiError(400, cartItem.message);
    }
    if (cartItem.data) {
        const updateQty = yield (0, shop_services_1.updateCartItemQuantityWithCartItemId)(cartItem.data.cart_items_id, cartItem.data.quantity + 1);
        if (updateQty.flag) {
            throw new apiError_1.ApiError(400, updateQty.message);
        }
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, updateQty.data, updateQty.message));
    }
    const createCartItem = yield (0, shop_services_1.createCartItemForUser)(product_id, user_id, 1);
    if (createCartItem.flag) {
        throw new apiError_1.ApiError(400, createCartItem.message);
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, createCartItem.data, createCartItem.message));
}));
exports.updateQuantity = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.body.user_id;
    const product_id = req.body.product_id;
    const quantity = req.body.quantity;
    if (!product_id) {
        throw new apiError_1.ApiError(404, "Product Not found");
    }
    if (!user_id) {
        throw new apiError_1.ApiError(404, "User Details Not found");
    }
    if (!quantity) {
        throw new apiError_1.ApiError(404, "Quantity Not found...");
    }
    const updateQty = yield (0, shop_services_1.updateCartItemQuantity)(user_id, product_id, quantity);
    if (updateQty.flag) {
        throw new apiError_1.ApiError(400, updateQty.message);
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, null, updateQty.message));
}));
exports.getUserCartItemFromUserId = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const redisHashKey = `user:${userId}`;
    const redisFieldKey = `cart`;
    const cachedData = yield redisClient_1.default.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
        console.log("cache hit");
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, JSON.parse(cachedData), "Successfully Fetched CartItems from redis"));
    }
    const cartItems = yield (0, shop_services_1.getUserAllCartItems)(userId);
    if (cartItems.flag) {
        throw new apiError_1.ApiError(400, cartItems.message);
    }
    yield redisClient_1.default.hSet(redisHashKey, redisFieldKey, JSON.stringify(cartItems));
    yield redisClient_1.default.expire(redisHashKey, 86400);
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, cartItems.data, cartItems.message));
}));
exports.deleteItemFromUserCart = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const product_id = req.params.productId;
    const userId = req.params.userId;
    const redisHashKey = `user:${userId}`;
    const redisFieldKey = `cart`;
    if (!product_id) {
        throw new apiError_1.ApiError(400, "Failed to find Product.");
    }
    const deleteItem = yield (0, shop_services_1.deleteItemFromUserCartService)(userId, product_id);
    if (deleteItem.flag) {
        throw new apiError_1.ApiError(400, deleteItem.message);
    }
    const userCartItems = yield (0, shop_services_1.getUserAllCartItems)(userId);
    if (userCartItems.flag) {
        throw new apiError_1.ApiError(400, userCartItems.message);
    }
    yield redisClient_1.default.hSet(redisHashKey, redisFieldKey, JSON.stringify(userCartItems));
    yield redisClient_1.default.expire(redisHashKey, 86400);
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, null, deleteItem.message));
}));
exports.getUserCartItemsCount = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const count = yield (0, shop_services_1.getUserAllCartItemsCount)(userId);
    if (count.flag) {
        throw new apiError_1.ApiError(400, count.message);
    }
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, count.data, count.message));
}));
exports.getAllProductInCategory = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const category_id = req.params.categoryId;
    const take = Number(req.query.take) || 10;
    const skip = Number(req.query.skip) || 0;
    if (!category_id) {
        throw new apiError_1.ApiError(404, "Failed to Find Category Id");
    }
    const redisHashKey = `category:${category_id}`;
    const redisFieldKey = `${skip}:${take}`;
    const cachedData = yield redisClient_1.default.hGet(redisHashKey, redisFieldKey);
    if (cachedData) {
        console.log("cache hit");
        return res
            .status(200)
            .json(new apiResponse_1.ApiResponse(200, JSON.parse(cachedData), "Successfully Fetched Categories from redis"));
    }
    const getAllProducts = yield (0, shop_services_1.getAllProductInCategoryService)(category_id, skip, take);
    if (getAllProducts.flag)
        throw new apiError_1.ApiError(400, getAllProducts.message);
    let productsWithSignedUrl = [];
    if (getAllProducts.data) {
        productsWithSignedUrl = yield (0, shop_services_1.GetSignedProductsImageUrl)(getAllProducts.data);
    }
    yield redisClient_1.default.hSet(redisHashKey, redisFieldKey, JSON.stringify(productsWithSignedUrl));
    yield redisClient_1.default.expire(redisHashKey, 60 * 60 * 1000);
    return res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, productsWithSignedUrl, getAllProducts.message));
}));
exports.createStripeSession = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let products = req.body.products;
    let user = req.user;
    const metadata = {
        email: user.email,
        productIds: products
            .map((product) => `${product.product_id}:${product.quantity}`)
            .join(","), // Format: "productId1:quantity1,productId2:quantity2"
        userId: user.id,
    };
    const lineItems = products.map((product) => ({
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
    const session = yield stripe.checkout.sessions.create({
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
        .json(new apiResponse_1.ApiResponse(200, session.id, "Payment Successful"));
}));
exports.getAllOrdersWithPayments = (0, asyncHander_1.asyncHander)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield (0, shop_services_1.getAllOrdersWithPaymentsService)();
    if (orders.flag)
        throw new apiError_1.ApiError(400, orders.message);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, orders.data, orders.message));
}));
