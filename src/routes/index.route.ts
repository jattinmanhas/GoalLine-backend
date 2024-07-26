import { Router } from "express";
export const router = Router();
import { adminAuthRoute } from "./admin/auth/auth.route";

router.use("/admin", adminAuthRoute);