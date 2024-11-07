import { Router, json, raw } from "express";
import { addToCart, createStripeSession, deleteItemFromUserCart, getAllCategories, getAllProductInCategory, getAllProducts, getProductById, getUserCartItemFromUserId, getUserCartItemsCount, searchCategories, searchProducts, updateQuantity } from "../../../controllers/user/shop/userShop.controller";
import { roleBasedPassportStrategy } from "../../../middleware/authMiddleware";

export const userShopRoute = Router();

userShopRoute.get("/getAllCategories", getAllCategories);
userShopRoute.get("/getAllProducts", getAllProducts);
userShopRoute.get("/product/:id", getProductById);
userShopRoute.get("/product", searchProducts);
userShopRoute.get("/categories", searchCategories);
userShopRoute.post("/addToCart", addToCart);
userShopRoute.put("/update-quantity", updateQuantity);
userShopRoute.get("/userCart/:userId", getUserCartItemFromUserId);
userShopRoute.delete("/deleteCartItem/:productId/:userId", deleteItemFromUserCart);
userShopRoute.get("/getCartCount/:userId", getUserCartItemsCount);
userShopRoute.get("/getAllProductsInCategories/:categoryId", getAllProductInCategory);
userShopRoute.post("/create-checkout-session", roleBasedPassportStrategy ,createStripeSession);
