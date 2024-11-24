import { Router } from "express";
import {
  addCategory,
  createNewCategory,
  createNewProduct, getAllProductsCount,
} from "../../../controllers/admin/shop/shop.controller";
import upload, {
  multipleFileUpload,
  singleFileUpload,
} from "../../../middleware/fileUpload";
import passport, { session } from "passport";
import { validateRequest } from "../../../middleware/validationMiddleware";
import { CategorySchema, ProductSchema } from "../../../utils/validation/categoryValidation";

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