import { Router } from "express";
import { addToCart, getAllCategories, getAllProducts, getProductById, searchProducts, updateQuantity } from "../../../controllers/user/shop/userShop.controller";

export const userShopRoute = Router();

userShopRoute.get("/getAllCategories", getAllCategories);
userShopRoute.get("/getAllProducts", getAllProducts);
userShopRoute.get("/product/:id", getProductById);
userShopRoute.get("/product/", searchProducts);
userShopRoute.post("/addToCart", addToCart);
userShopRoute.post("/update-quantity", updateQuantity);