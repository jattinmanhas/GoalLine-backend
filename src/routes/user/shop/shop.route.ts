import { Router } from "express";
import { getAllCategories, getAllProducts, getProductById, searchProducts } from "../../../controllers/user/shop/userShop.controller";

export const userShopRoute = Router();

userShopRoute.get("/getAllCategories", getAllCategories);
userShopRoute.get("/getAllProducts", getAllProducts);
userShopRoute.get("/product/:id", getProductById);
userShopRoute.get("/product/", searchProducts);
