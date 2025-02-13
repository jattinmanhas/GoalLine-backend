import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/handlers/apiError";
import { asyncHander } from "../utils/handlers/asyncHander";
import { UserPayload } from "../types/index.types";
import { getRoleDetailsFromRoleId } from "../services/authServices/auth.services";

export const AuthorizationMiddleware = asyncHander(async(req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserPayload;
    const roleDetails = await getRoleDetailsFromRoleId(user.roleId);

    if(roleDetails.flag){
        throw new ApiError(401, "Unauthorized", [{message: roleDetails.message, field: "Authorization Middleware"}], null);
    }

    if(roleDetails.data?.name !== "ADMIN"){
        throw new ApiError(401, "Unauthorized", [{message: "Unauthorized", field: "Authorization Middleware"}], null);
    }

    return next();
})