import { Router } from "express";
import { addToCart, createNewCategory, createNewProduct, createStripeSession, deleteItemFromUserCart, getAllCategories, getAllCategoryCount, getAllOrdersWithPayments, getAllProductInCategory, getAllProducts, getAllProductsCount, getCurrentDayEarnings, getProductById, getUserCartItemFromUserId, getUserCartItemsCount, searchCategories, searchProducts, updateQuantity } from "../../controllers/shop/shop.controller";
import { authenticationMiddleware } from "../../middleware/authMiddleware";
import { AuthorizationMiddleware } from "../../middleware/authorizationMiddleware";
import { multipleFileUpload, singleFileUpload } from "../../middleware/fileUpload";
import { validateRequest } from "../../middleware/validationMiddleware";
import { categoryValidation, productValidation } from "../../utils/validation/shopValidation";

export const shopRoute = Router();
// ---------------------------
shopRoute.post("/add-category", authenticationMiddleware, AuthorizationMiddleware,  singleFileUpload("file"),validateRequest(categoryValidation), createNewCategory);

shopRoute.post("/add-product", authenticationMiddleware, AuthorizationMiddleware, multipleFileUpload("files", 8), validateRequest(productValidation), createNewProduct);

shopRoute.get("/products-count", authenticationMiddleware, AuthorizationMiddleware, getAllProductsCount);

shopRoute.get("/category-count", authenticationMiddleware, AuthorizationMiddleware, getAllCategoryCount);

shopRoute.get("/getAllOrdersWithPayments", authenticationMiddleware, AuthorizationMiddleware, getAllOrdersWithPayments);

shopRoute.get("/currentDayEarnings", authenticationMiddleware, AuthorizationMiddleware, getCurrentDayEarnings);

// ---------------------------
shopRoute.get("/getAllCategories", getAllCategories);
shopRoute.get("/getAllProducts", getAllProducts);
shopRoute.get("/product/:id", getProductById);
shopRoute.get("/product", searchProducts);
shopRoute.get("/categories", searchCategories);
shopRoute.post("/addToCart", addToCart);
shopRoute.put("/update-quantity", updateQuantity);
shopRoute.get("/userCart/:userId", getUserCartItemFromUserId);
shopRoute.delete("/deleteCartItem/:productId/:userId", deleteItemFromUserCart);
shopRoute.get("/getCartCount/:userId", getUserCartItemsCount);
shopRoute.get("/getAllProductsInCategories/:categoryId", getAllProductInCategory);
shopRoute.post("/create-checkout-session" ,createStripeSession);
