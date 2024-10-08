import { Router } from "express";
import { addCategory } from "../../../controllers/admin/shop/shop.controller";

export const shopAdminRoute = Router();

shopAdminRoute.post("/addCategory", addCategory);