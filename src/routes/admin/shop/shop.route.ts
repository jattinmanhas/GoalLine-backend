import { Router } from "express";
import {
  addCategory,
  createNewCategory,
  createNewProduct, getAllProductsCount,
  getCurrentDayEarnings,
} from "../../../controllers/admin/shop/shop.controller";
import upload, {
  multipleFileUpload,
  singleFileUpload,
} from "../../../middleware/fileUpload";
import passport, { session } from "passport";
import { validateRequest } from "../../../middleware/validationMiddleware";
import { CategorySchema, ProductSchema } from "../../../utils/validation/categoryValidation";
import { getAllOrdersWithPayments } from "../../../controllers/user/shop/userShop.controller";

export const shopAdminRoute = Router();

shopAdminRoute.post(
  "/addCategory",
  passport.authenticate("jwt-admin", { session: false }),
  singleFileUpload("file"),
  createNewCategory
);

shopAdminRoute.post(
  "/addProduct",
  passport.authenticate("jwt-admin", { session: false }),
  multipleFileUpload("file", 8),
  validateRequest(ProductSchema),
  createNewProduct
);

shopAdminRoute.get(
    "/productsCount",
    passport.authenticate("jwt-admin", { session: false }),
    getAllProductsCount
);

shopAdminRoute.get(
    "/categoryCount",
    passport.authenticate("jwt-admin", { session: false }),
    getAllProductsCount
);

shopAdminRoute.get("/getAllOrdersWithPayments", passport.authenticate("jwt-admin", { session: false }), getAllOrdersWithPayments);

shopAdminRoute.get("/currentDayEarnings", passport.authenticate("jwt-admin", { session: false }), getCurrentDayEarnings);